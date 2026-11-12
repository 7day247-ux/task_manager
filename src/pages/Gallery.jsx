import React, { useState } from 'react';
import ImageGrid, { UploadButton, KIND } from '../components/ImageGrid';
import { STORAGE_LIMIT, fmtBytes } from '../utils/storage';

const KINDS = [{ id: 'all', label: '전체' }, { id: 'final', label: '최종 디자인' }, { id: 'mood', label: '무드보드' }];

export default function Gallery({ images, projects, tasks, onReload, showToast }) {
  const [kind, setKind] = useState('final');
  const [pid, setPid]   = useState('');
  const [upKind, setUpKind] = useState('final');
  const [upPid, setUpPid]   = useState('');

  const pname = {}; projects.forEach(p => { pname[p.id] = p.name; });
  const tname = {}; tasks.forEach(t => { tname[t.id] = t.name; });
  const caption = img => pname[img.project_id] || tname[img.task_id] || '';

  const shown = images.filter(i => (kind === 'all' || i.kind === kind) && (!pid || String(i.project_id) === pid));
  const used  = images.reduce((s, i) => s + (i.bytes || 0), 0);
  const cnt   = k => images.filter(i => i.kind === k).length;
  const usedProjects = projects.filter(p => images.some(i => i.project_id === p.id));

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="pt">갤러리</div>
          <div className="ps">최종 디자인 {cnt('final')}장 · 무드보드 {cnt('mood')}장 · {fmtBytes(used)} / 1GB ({Math.round(used / STORAGE_LIMIT * 100)}%)</div>
        </div>
      </div>

      <div className="gl-up">
        <div className="gl-up-ttl">이미지 올리기</div>
        <div className="gl-up-row">
          <select className="fs" value={upKind} onChange={e => setUpKind(e.target.value)}>
            <option value="final">최종 디자인</option>
            <option value="mood">무드보드</option>
          </select>
          <select className="fs" value={upPid} onChange={e => setUpPid(e.target.value)}>
            <option value="">제품 연결 안함</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <UploadButton className="btn btn-p" label="+ 사진 고르기" kind={upKind}
            projectId={upPid ? parseInt(upPid) : null} onDone={onReload} showToast={showToast} />
        </div>
        <div className="fhint">여러 장을 한 번에 고를 수 있어요. 올릴 때 자동으로 줄여서 저장하고, 원본은 올라가지 않아요. JPG·PNG만 되고 AI·PSD·PDF는 안 돼요.</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        {KINDS.map(k => <button key={k.id} className={'chip' + (kind === k.id ? ' on' : '')} onClick={() => setKind(k.id)}>{k.label}</button>)}
        {usedProjects.length > 0 && (
          <select className="fs" value={pid} onChange={e => setPid(e.target.value)}
            style={{ width: 'auto', padding: '5px 10px', fontSize: 12, borderRadius: 20 }}>
            <option value="">모든 제품</option>
            {usedProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
      </div>

      {shown.length
        ? <ImageGrid images={shown} caption={caption} onChanged={onReload} showToast={showToast} />
        : <div className="empty-r" style={{ padding: '3rem 1rem', textAlign: 'center', color: '#9A9590', fontSize: 13 }}>
            {images.length ? '조건에 맞는 이미지가 없어요.' : '아직 올린 이미지가 없어요. 위에서 사진을 골라 올려보세요.'}
          </div>}
    </div>
  );
}
