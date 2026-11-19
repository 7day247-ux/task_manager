import React, { useState } from 'react';
import Icon from './Icon';
import { api } from '../utils/helpers';
import { P_STATUS, P_LINES } from '../utils/products';

// 제품 추가·수정. 저장 후 onSaved(새 제품 id)
export default function ProductModal({ product, projects, onClose, onSaved, onDeleted, showToast }) {
  const isEdit = !!product;
  const [f, setF] = useState({
    name: product?.name || '',
    line: product?.line || '빙과',
    factory: product?.factory || '',
    status: product?.status || '진행',
    summary: product?.summary || '',
    mine: !!product?.mine,
    project_id: product?.project_id || '',
  });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }));

  async function save() {
    if (!f.name.trim()) { showToast('제품 이름을 적어 주세요', true); return; }
    setBusy(true);
    const body = JSON.stringify({ ...f, name: f.name.trim(), project_id: f.project_id ? Number(f.project_id) : null, updated_at: new Date().toISOString() });
    try {
      let id = product?.id;
      if (isEdit) {
        await api('products?id=eq.' + id, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body });
      } else {
        const res = await api('products', { method: 'POST', headers: { Prefer: 'return=representation' }, body });
        id = (Array.isArray(res) ? res[0] : res).id;
      }
      await onSaved(id);
    } catch (e) {
      showToast('저장 실패: ' + e.message, true);
      setBusy(false);
    }
  }

  async function del() {
    if (!confirm(`'${product.name}' 제품을 지울까요?\n회의록 내용은 그대로 남고 연결만 풀려요.`)) return;
    setBusy(true);
    try {
      await api('products?id=eq.' + product.id, { method: 'DELETE' });
      await onDeleted();
    } catch (e) {
      showToast('삭제 실패: ' + e.message, true);
      setBusy(false);
    }
  }

  return (
    <div className="ovl" style={{ display: 'flex' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhd">
          <div className="mhd-t">{isEdit ? '제품 정보 수정' : '새 제품'}</div>
          <button className="xbtn" onClick={onClose} aria-label="닫기"><Icon name="x" size={20} /></button>
        </div>
        <div className="mbd">
          <div className="fg">
            <label className="fl" htmlFor="pm-name">제품 이름</label>
            <input id="pm-name" className="fi" value={f.name} onChange={e => set('name', e.target.value)} placeholder="자몽요거트 모나카" />
          </div>
          <div className="two">
            <div className="fg">
              <label className="fl" htmlFor="pm-line">구분</label>
              <select id="pm-line" className="fi" value={f.line} onChange={e => set('line', e.target.value)}>
                {P_LINES.map(l => <option key={l}>{l}</option>)}
                <option value="">기타</option>
              </select>
            </div>
            <div className="fg">
              <label className="fl" htmlFor="pm-fac">공장</label>
              <input id="pm-fac" className="fi" value={f.factory} onChange={e => set('factory', e.target.value)} placeholder="김제" />
            </div>
          </div>
          <div className="fg">
            <span className="fl">상태</span>
            <div className="pd-stat-row">
              {P_STATUS.map(s => (
                <button key={s} type="button" className={'pd-stat' + (f.status === s ? ' on' : '')} onClick={() => set('status', s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="fg">
            <label className="fl" htmlFor="pm-sum">지금 상황 (한 줄)</label>
            <textarea id="pm-sum" className="fi" rows={2} value={f.summary} onChange={e => set('summary', e.target.value)} />
          </div>
          <div className="fg">
            <label className="pd-check">
              <input type="checkbox" checked={f.mine} onChange={e => set('mine', e.target.checked)} />
              내 디자인 업무
            </label>
          </div>
          {projects.length > 0 && (
            <div className="fg">
              <label className="fl" htmlFor="pm-prj">연결 프로젝트</label>
              <select id="pm-prj" className="fi" value={f.project_id || ''} onChange={e => set('project_id', e.target.value)}>
                <option value="">없음</option>
                {projects.map(pr => <option key={pr.id} value={pr.id}>{pr.name}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="mft">
          {isEdit && <button className="btn btn-g" style={{ marginRight: 'auto', color: '#E24B4A' }} onClick={del} disabled={busy}><Icon name="trash" size={14} /> 삭제</button>}
          <button className="btn" onClick={onClose}>취소</button>
          <button className="btn btn-p" onClick={save} disabled={busy}>저장</button>
        </div>
      </div>
    </div>
  );
}
