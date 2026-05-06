import React, { useState } from 'react';
import { api } from '../utils/helpers';

export default function LeaveModal({ leaves, onClose, onSaved, showToast }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amt, setAmt]   = useState('1');

  const total = leaves.reduce((s, l) => s + Number(l.amount), 0);

  async function add() {
    if (!date) { showToast('날짜를 선택해주세요', true); return; }
    showToast('저장 중...');
    try {
      await api('leaves', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ leave_date: date, amount: parseFloat(amt), note: '' }) });
      await onSaved();
      showToast('저장 완료');
    } catch (e) { showToast('저장 실패: ' + e.message, true); }
  }

  async function del(id) {
    if (!confirm('이 연차를 삭제할까요?')) return;
    showToast('삭제 중...');
    try {
      await api('leaves?id=eq.' + id, { method: 'DELETE' });
      await onSaved();
    } catch (e) { showToast('삭제 실패: ' + e.message, true); }
  }

  const sorted = [...leaves].sort((a, b) => b.leave_date.localeCompare(a.leave_date));

  return (
    <div className="ovl" style={{ display: 'flex' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div className="mhd">
          <div>
            <div className="mhd-t">🏖️ 연차 관리</div>
            <div className="mhd-s">총 {total}일 사용</div>
          </div>
          <button className="xbtn" onClick={onClose}>✕</button>
        </div>
        <div className="mbd">
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input className="fi" type="date" style={{ flex: 1 }} value={date} onChange={e => setDate(e.target.value)} />
            <select className="fs" style={{ width: 80 }} value={amt} onChange={e => setAmt(e.target.value)}>
              <option value="0.5">0.5일</option>
              <option value="1">1일</option>
            </select>
            <button className="btn btn-p btn-sm" onClick={add}>추가</button>
          </div>

          {!sorted.length ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#9A9590', fontSize: 13 }}>사용한 연차가 없어요</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ padding: '7px 10px', textAlign: 'left', fontSize: 11, color: '#9A9590', background: '#FAF9F6', borderBottom: '1px solid #E8E4DC' }}>날짜</th>
                  <th style={{ padding: '7px 10px', textAlign: 'center', fontSize: 11, color: '#9A9590', background: '#FAF9F6', borderBottom: '1px solid #E8E4DC' }}>일수</th>
                  <th style={{ padding: '7px 10px', background: '#FAF9F6', borderBottom: '1px solid #E8E4DC' }}></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #E8E4DC' }}>
                    <td style={{ padding: '8px 10px', color: '#1C1A16' }}>{l.leave_date.replace(/-/g, '.')}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: '#185FA5', fontWeight: 600 }}>{l.amount}일</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                      <button onClick={() => del(l.id)} style={{ fontSize: 11, color: '#E24B4A', background: 'none', border: 'none', cursor: 'pointer' }}>삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="mft">
          <button className="btn" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}
