import React, { useEffect, useState } from 'react';
import { signedUrls, deleteImage, uploadImage } from '../utils/storage';

export const KIND = { final: '최종 디자인', mood: '무드보드' };

// 미리보기 격자. 누르면 크게 보고, 거기서 삭제할 수 있다.
export default function ImageGrid({ images, caption, onChanged, showToast, small }) {
  const [urls, setUrls] = useState({});
  const [open, setOpen] = useState(null);
  const [bigUrl, setBigUrl] = useState('');
  const key = images.map(i => i.id).join(',');

  useEffect(() => {
    let alive = true;
    if (!images.length) return;
    signedUrls(images.map(i => i.thumb_path)).then(u => { if (alive) setUrls(u); }).catch(e => showToast && showToast(e.message, true));
    return () => { alive = false; };
  }, [key]);

  useEffect(() => {
    let alive = true;
    setBigUrl('');
    if (open) signedUrls([open.path]).then(u => { if (alive) setBigUrl(u[open.path] || ''); }).catch(() => {});
    return () => { alive = false; };
  }, [open && open.id]);

  async function remove() {
    if (!open || !confirm('이 이미지를 삭제할까요?')) return;
    const img = open;
    setOpen(null);
    try { await deleteImage(img); await onChanged(); }
    catch (e) { showToast && showToast(e.message, true); }
  }

  return (
    <>
      <div className={'ig' + (small ? ' ig-sm' : '')}>
        {images.map(img => (
          <button type="button" key={img.id} className="ig-i" onClick={() => setOpen(img)} title={img.title}>
            {urls[img.thumb_path]
              ? <img src={urls[img.thumb_path]} alt={img.title} loading="lazy" decoding="async" />
              : <span className="ig-ph" />}
            {caption && caption(img) && <span className="ig-cap">{caption(img)}</span>}
          </button>
        ))}
      </div>
      {open && (
        <div className="lb" onClick={() => setOpen(null)}>
          <div className="lb-top" onClick={e => e.stopPropagation()}>
            <span className="lb-ttl">{KIND[open.kind]}{caption && caption(open) ? ' · ' + caption(open) : ''}</span>
            <button type="button" className="lb-btn lb-del" onClick={remove}>삭제</button>
            <button type="button" className="lb-btn" onClick={() => setOpen(null)}>닫기</button>
          </div>
          {bigUrl ? <img className="lb-img" src={bigUrl} alt={open.title} onClick={e => e.stopPropagation()} /> : <div className="lb-load">불러오는 중…</div>}
        </div>
      )}
    </>
  );
}

// 파일 고르기 버튼. 여러 장을 차례로 올리고 진행 상황을 보여준다.
export function UploadButton({ label, kind, taskId, projectId, onDone, showToast, className = 'btn btn-sm' }) {
  const [prog, setProg] = useState(null);

  async function pick(e) {
    const files = [...e.target.files];
    e.target.value = '';
    if (!files.length) return;
    let fail = 0;
    for (let i = 0; i < files.length; i++) {
      setProg((i + 1) + '/' + files.length);
      try { await uploadImage(files[i], { kind, taskId, projectId }); }
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
