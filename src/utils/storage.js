import { SB_URL, SB_KEY } from './constants';
import { api } from './helpers';
import { getAccessToken } from './auth';

const BUCKET = 'designs';
const BASE = SB_URL + '/storage/v1';
export const STORAGE_LIMIT = 1024 * 1024 * 1024; // 무료 요금제 저장 용량 1GB

async function headers(extra = {}) {
  const token = await getAccessToken();
  if (!token) throw new Error('로그인이 필요합니다.');
  return { apikey: SB_KEY, Authorization: 'Bearer ' + token, ...extra };
}

// 로그인한 사용자의 id. 저장소는 이 이름의 폴더 안에서만 읽고 쓸 수 있다.
async function userId() {
  const token = await getAccessToken();
  if (!token) throw new Error('로그인이 필요합니다.');
  const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(part)).sub;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('이미지를 열 수 없어요: ' + file.name)); };
    img.src = url;
  });
}

// 긴 변이 maxSide를 넘지 않게 줄여 JPEG로 만든다. 투명 배경은 흰색으로 채운다.
function resize(img, maxSide, quality) {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#fff'; cx.fillRect(0, 0, w, h);
  cx.imageSmoothingQuality = 'high';
  cx.drawImage(img, 0, 0, w, h);
  return new Promise((resolve, reject) => cv.toBlob(b => b ? resolve({ blob: b, w, h }) : reject(new Error('이미지 변환 실패')), 'image/jpeg', quality));
}

async function put(path, blob) {
  const res = await fetch(BASE + '/object/' + BUCKET + '/' + path, {
    method: 'POST', headers: await headers({ 'Content-Type': 'image/jpeg', 'x-upsert': 'false' }), body: blob,
  });
  if (!res.ok) throw new Error('올리기 실패 (' + res.status + ')');
}

// 원본은 올리지 않는다. 크게 볼 이미지(1600px)와 미리보기(480px)만 저장한다.
export async function uploadImage(file, { kind, taskId = null, projectId = null }) {
  if (!file.type.startsWith('image/')) throw new Error('이미지 파일만 올릴 수 있어요: ' + file.name);
  const img = await loadImage(file);
  const full  = await resize(img, 1600, 0.82);
  const thumb = await resize(img, 480, 0.72);
  const uid = await userId();
  const key = uid + '/' + kind + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  const path = key + '.jpg', thumbPath = key + '_t.jpg';
  await put(path, full.blob);
  await put(thumbPath, thumb.blob);
  try {
    await api('images', { method: 'POST', body: JSON.stringify({
      kind, task_id: taskId, project_id: projectId, path, thumb_path: thumbPath,
      width: full.w, height: full.h, bytes: full.blob.size + thumb.blob.size,
      title: file.name.replace(/\.[^.]+$/, '').slice(0, 80),
    }) });
  } catch (e) {
    await removeObjects([path, thumbPath]).catch(() => {});
    throw e;
  }
}

async function removeObjects(paths) {
  const res = await fetch(BASE + '/object/' + BUCKET, {
    method: 'DELETE', headers: await headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ prefixes: paths }),
  });
  if (!res.ok) throw new Error('삭제 실패 (' + res.status + ')');
}

export async function deleteImage(img) {
  await removeObjects([img.path, img.thumb_path]);
  await api('images?id=eq.' + img.id, { method: 'DELETE' });
}

// 비공개 저장소라 1시간짜리 임시 주소를 받아서 보여준다. 받은 주소는 50분 동안 다시 쓴다.
const cache = new Map();
export async function signedUrls(paths) {
  const now = Date.now();
  const need = paths.filter(p => !(cache.get(p) && cache.get(p).until > now));
  for (let i = 0; i < need.length; i += 200) {
    const res = await fetch(BASE + '/object/sign/' + BUCKET, {
      method: 'POST', headers: await headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ expiresIn: 3600, paths: need.slice(i, i + 200) }),
    });
    if (!res.ok) throw new Error('이미지 주소를 받지 못했어요 (' + res.status + ')');
    (await res.json()).forEach(r => {
      const u = r.signedURL || r.signedUrl;
      if (u && !r.error) cache.set(r.path, { url: BASE + u, until: now + 50 * 60 * 1000 });
    });
  }
  const out = {};
  paths.forEach(p => { const c = cache.get(p); if (c) out[p] = c.url; });
  return out;
}

export function fmtBytes(n) {
  return n >= 1048576 ? (n / 1048576).toFixed(1) + 'MB' : Math.max(1, Math.round(n / 1024)) + 'KB';
}
