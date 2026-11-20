import React, { useEffect, useRef, useState } from 'react';
import { signedUrls, deleteImage, uploadImage, updateImage, addComment, setCommentDone, deleteComment } from '../utils/storage';

export const KIND = { final: '최종 디자인', mood: '무드보드' };
export const ROUNDS = ['1차', '2차', '3차', '4차', '5차', '최종'];

const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const pad = n => String(n).padStart(2, '0');

// '2026-11-20' → '261120금'
export function fmtRefDate(d) {
  const [y, m, dd] = String(d || '').split('-').map(Number);
  if (!y) return '';
  return String(y).slice(2) + pad(m) + pad(dd) + DOW[new Date(y, m - 1, dd).getDay()];
}
// '1차 · 261120금'
export function imgLabel(img) {
  return [img.round, fmtRefDate(img.ref_date)].filter(Boolean).join(' · ');
}
export function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

// 제품 선택 목록: 진행 중인 제품을 먼저, 보류·완료는 아래에 묶는다.
export function ProjectOptions({ projects, empty }) {
  const act = projects.filter(p => (p.status || 'active') === 'active');
  const rest = projects.filter(p => (p.status || 'active') !== 'active');
  return (
    <>
      <option value="">{empty}</option>
      {act.length > 0 && <optgroup label="진행 중">{act.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</optgroup>}
      {rest.length > 0 && <optgroup label="보류·완료">{rest.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</optgroup>}
    </>
  );
}

// 미리보기 격자. 누르면 크게 보고, 좌우로 넘기고, 코멘트·차수·제품 연결을 고칠 수 있다.
export default function ImageGrid({ images, caption, comments, projects = [], tasks = [], onChanged, showToast, small }) {
  const [urls, setUrls] = useState({});
  const [openId, setOpenId] = useState(null);
  const key = images.map(i => i.id).join(',');

  useEffect(() => {
    let alive = true;
    if (!images.length) return;
    signedUrls(images.map(i => i.thumb_path)).then(u => { if (alive) setUrls(u); }).catch(e => showToast && showToast(e.message, true));
    return () => { alive = false; };
  }, [key]);

  const fixOpen = {};
  (comments || []).forEach(c => { if (c.kind === 'fix' && !c.done) fixOpen[c.image_id] = (fixOpen[c.image_id] || 0) + 1; });

  return (
    <>
      <div className={'ig' + (small ? ' ig-sm' : '')}>
        {images.map(img => (
          <button type="button" key={img.id} className="ig-i" onClick={() => setOpenId(img.id)} title={img.title}>
            {urls[img.thumb_path]
              ? <img src={urls[img.thumb_path]} alt={img.title} loading="lazy" decoding="async" />
              : <span className="ig-ph" />}
            {!small && imgLabel(img) && <span className="ig-tag">{imgLabel(img)}</span>}
            {fixOpen[img.id] > 0 && <span className="ig-fix">수정 {fixOpen[img.id]}</span>}
            {caption && caption(img) && <span className="ig-cap">{caption(img)}</span>}
          </button>
        ))}
      </div>
      {openId !== null && (
        <Lightbox images={images} openId={openId} setOpenId={setOpenId} thumbs={urls} caption={caption}
          comments={comments} projects={projects} tasks={tasks} onChanged={onChanged} showToast={showToast}
          onClose={() => setOpenId(null)} />
      )}
    </>
  );
}

function Lightbox({ images, openId, setOpenId, thumbs, caption, comments, projects, tasks, onChanged, showToast, onClose }) {
  const idx = images.findIndex(i => i.id === openId);
  const img = images[idx];
  const [urls, setUrls] = useState({});
  const [dx, setDx] = useState(0);
  const [drag, setDrag] = useState(false);
  const [pOpen, setPOpen] = useState(true);
  const [text, setText] = useState('');
  const [ckind, setCkind] = useState('memo');
  const [busy, setBusy] = useState(false);
  const touch = useRef(null);
  const withPanel = !!comments;

  // 지워졌거나 목록에서 사라졌으면 닫는다.
  useEffect(() => { if (!img) onClose(); }, [!!img]);

  // 지금 사진과 양옆 사진의 큰 이미지 주소를 미리 받아둔다.
  useEffect(() => {
    let alive = true;
    const paths = [images[idx - 1], images[idx], images[idx + 1]].filter(Boolean).map(i => i.path);
    if (paths.length) signedUrls(paths).then(u => { if (alive) setUrls(p => ({ ...p, ...u })); }).catch(() => {});
    return () => { alive = false; };
  }, [openId]);

  useEffect(() => { setText(''); }, [openId]);

  const go = d => { const n = images[idx + d]; if (n) setOpenId(n.id); };

  useEffect(() => {
    function onKey(e) {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!img) return null;

  const onStart = e => {
    if (e.touches.length > 1) { touch.current = null; return; }
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, lock: null };
  };
  const onMove = e => {
    const s = touch.current;
    if (!s || e.touches.length > 1) return;
    const ddx = e.touches[0].clientX - s.x, ddy = e.touches[0].clientY - s.y;
    if (s.lock === null && (Math.abs(ddx) > 8 || Math.abs(ddy) > 8)) s.lock = Math.abs(ddx) > Math.abs(ddy) ? 'x' : 'y';
    if (s.lock === 'x') {
      const edge = (ddx > 0 && idx === 0) || (ddx < 0 && idx === images.length - 1);
      setDrag(true);
      setDx(edge ? ddx / 4 : ddx);
    }
  };
  const onEnd = () => {
    const s = touch.current;
    touch.current = null;
    setDrag(false);
    if (s && s.lock === 'x') { if (dx < -60) go(1); else if (dx > 60) go(-1); }
    setDx(0);
  };

  async function patch(p) {
    try { await updateImage(img.id, p); await onChanged(); }
    catch (e) { showToast && showToast(e.message, true); }
  }

  async function remove() {
    if (!confirm('이 이미지를 삭제할까요?')) return;
    const next = images[idx + 1] || images[idx - 1];
    try {
      await deleteImage(img);
      if (next) setOpenId(next.id); else onClose();
      await onChanged();
    } catch (e) { showToast && showToast(e.message, true); }
  }

  async function submit(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    try { await addComment(img.id, ckind, body); setText(''); await onChanged(); }
    catch (err) { showToast && showToast(err.message, true); }
    setBusy(false);
  }
  async function toggle(c) {
    try { await setCommentDone(c.id, !c.done); await onChanged(); }
    catch (err) { showToast && showToast(err.message, true); }
  }
  async function removeComment(c) {
    try { await deleteComment(c.id); await onChanged(); }
    catch (err) { showToast && showToast(err.message, true); }
  }

  // 태스크 목록: 연결된 제품이 있으면 그 제품의 태스크만, 진행 중인 것 먼저.
  const tList = tasks
    .filter(t => !img.project_id || t.projectId === img.project_id || t.id === img.task_id)
    .sort((a, b) => (a.status === 'done') - (b.status === 'done'));
  function pickTask(v) {
    const t = tasks.find(x => String(x.id) === v);
    const p = { task_id: t ? t.id : null };
    if (t && t.projectId && !img.project_id) p.project_id = t.projectId;
    patch(p);
  }

  const list = withPanel ? comments.filter(c => c.image_id === img.id) : [];
  const fixLeft = list.filter(c => c.kind === 'fix' && !c.done).length;
  const big = urls[img.path];
  const label = imgLabel(img);

  return (
    <div className="lb">
      <div className="lb-top">
        <span className="lb-ttl">{KIND[img.kind]}{caption && caption(img) ? ' · ' + caption(img) : ''}{label ? ' · ' + label : ''}</span>
        <span className="lb-cnt">{idx + 1} / {images.length}</span>
        {!withPanel && <button type="button" className="lb-btn lb-del" onClick={remove}>삭제</button>}
        <button type="button" className="lb-btn" onClick={onClose}>닫기</button>
      </div>

      <div className="lb-stage" onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd} onTouchCancel={onEnd}>
        <div className="lb-slide" style={{ transform: 'translateX(' + dx + 'px)', transition: drag ? 'none' : 'transform .2s ease' }}>
          {big
            ? <img key={img.id} className="lb-img" src={big} alt={img.title} draggable={false} />
            : thumbs[img.thumb_path]
              ? <img key={img.id} className="lb-img lb-blur" src={thumbs[img.thumb_path]} alt="" draggable={false} />
              : <div className="lb-load">불러오는 중…</div>}
        </div>
        {idx > 0 && <button type="button" className="lb-nav lb-prev" onClick={() => go(-1)} aria-label="이전">‹</button>}
        {idx < images.length - 1 && <button type="button" className="lb-nav lb-next" onClick={() => go(1)} aria-label="다음">›</button>}
      </div>

      {withPanel && (
        <div className="lb-panel">
          <div className="lb-meta">
            <select className="fs lb-sel" value={img.round || ''} onChange={e => patch({ round: e.target.value })}>
              <option value="">차수 없음</option>
              {ROUNDS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <input type="date" className="fs lb-sel" value={img.ref_date || ''} onChange={e => e.target.value && patch({ ref_date: e.target.value })} />
            <select className="fs lb-sel lb-sel-w" value={img.project_id || ''} onChange={e => patch({ project_id: e.target.value ? parseInt(e.target.value) : null })}>
              <ProjectOptions projects={projects} empty="제품 연결 안함" />
            </select>
            {tasks.length > 0 && (
              <select className="fs lb-sel lb-sel-w" value={img.task_id || ''} onChange={e => pickTask(e.target.value)}>
                <option value="">태스크 연결 안함</option>
                {tList.map(t => <option key={t.id} value={t.id}>{t.status === 'done' ? '(완료) ' : ''}{t.name}</option>)}
              </select>
            )}
            <button type="button" className="lb-del2" onClick={remove}>삭제</button>
          </div>

          <button type="button" className="lb-ph" onClick={() => setPOpen(o => !o)}>
            <span>코멘트 {list.length}{fixLeft > 0 ? ' · 수정 요청 ' + fixLeft + '건 남음' : ''}</span>
            <span>{pOpen ? '접기' : '펼치기'}</span>
          </button>

          {pOpen && (
            <>
              {list.length === 0 && <div className="lb-empty">아직 코멘트가 없어요. 고칠 부분이나 메모를 남겨보세요.</div>}
              {list.map(c => (
                <div key={c.id} className={'lb-c' + (c.done ? ' done' : '')}>
                  {c.kind === 'fix'
                    ? <input type="checkbox" checked={c.done} onChange={() => toggle(c)} aria-label="수정 완료" />
                    : <span className="lb-c-dot" />}
                  <div className="lb-c-b">
                    <span className={'lb-c-k ' + c.kind}>{c.kind === 'fix' ? '수정 요청' : '메모'}</span>
                    {c.body}
                  </div>
                  <button type="button" className="lb-c-x" onClick={() => removeComment(c)} aria-label="코멘트 삭제">×</button>
                </div>
              ))}
              <form className="lb-form" onSubmit={submit}>
                <div className="lb-seg">
                  <button type="button" className={ckind === 'memo' ? 'on' : ''} onClick={() => setCkind('memo')}>메모</button>
                  <button type="button" className={ckind === 'fix' ? 'on' : ''} onClick={() => setCkind('fix')}>수정 요청</button>
                </div>
                <input className="fs" value={text} onChange={e => setText(e.target.value)}
                  placeholder={ckind === 'fix' ? '예: 로고 크기 키우기' : '메모를 남겨요'} />
                <button type="submit" className="btn btn-p" disabled={busy || !text.trim()}>등록</button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// 파일 고르기 버튼. 여러 장을 차례로 올리고 진행 상황을 보여준다.
export function UploadButton({ label, kind, taskId, projectId, round = '', refDate = null, onDone, showToast, className = 'btn btn-sm' }) {
  const [prog, setProg] = useState(null);

  async function pick(e) {
    const files = [...e.target.files];
    e.target.value = '';
    if (!files.length) return;
    let fail = 0;
    for (let i = 0; i < files.length; i++) {
      setProg((i + 1) + '/' + files.length);
      try { await uploadImage(files[i], { kind, taskId, projectId, round, refDate }); }
      catch (err) { fail++; showToast && showToast(err.message, true); }
    }
    setProg(null);
    await onDone();
    if (fail && showToast) showToast(fail + '장을 올리지 못했어요.', true);
  }

  return (
    <label className={className + (prog ? ' is-busy' : '')}>
      {prog ? '올리는 중 ' + prog : label}
      <input type="file" accept="image/*" multiple hidden disabled={!!prog} onChange={pick} />
    </label>
  );
}
