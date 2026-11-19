import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { api, today } from '../utils/helpers';
import { P_STATUS, normName } from '../utils/products';

function emptyRow() {
  return { id: null, title: '', content: '', tags: '', due_date: '', assignee: '', task_id: null, product_id: null, status: '' };
}

export default function MeetingModal({ meeting, mtItems, tasks, products = [], onClose, onSaved, showToast }) {
  const isEdit = !!meeting;
  const [date, setDate]       = useState('');
  const [type, setType]       = useState('meeting');
  const [title, setTitle]     = useState('');
  const [attendees, setAtt]   = useState('');
  const [mRows, setMRows]     = useState([emptyRow()]);

  useEffect(() => {
    if (meeting) {
      setDate(meeting.meet_date || '');
      setType(meeting.meet_type || 'meeting');
      setTitle(meeting.meet_title || '');
      setAtt(meeting.attendees || '');
      const its = mtItems.filter(i => i.meeting_id === meeting.id);
      setMRows(its.length
        ? its.map(it => ({ id: it.id, title: it.title || '', content: it.content || '', tags: it.tags || '', due_date: it.due_date || '', assignee: it.assignee || '', task_id: it.task_id || null, product_id: it.product_id || null, status: it.status || '' }))
        : [emptyRow()]
      );
    } else {
      setDate(today());
      setType('meeting'); setTitle(''); setAtt('');
      setMRows([emptyRow()]);
    }
  }, [meeting, mtItems]);

  function updateRow(i, key, val) {
    setMRows(prev => prev.map((r, idx) => idx === i ? { ...r, [key]: val } : r));
  }

  async function save() {
    if (!date) { showToast('날짜를 선택해주세요', true); return; }
    showToast('저장 중...');
    try {
      let mId = isEdit ? meeting.id : null;
      const body = JSON.stringify({ meet_date: date, meet_type: type, meet_title: title, attendees });
      if (isEdit) {
        await api('meetings?id=eq.' + meeting.id, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body });
      } else {
        const res = await api('meetings', { method: 'POST', headers: { Prefer: 'return=representation' }, body });
        mId = (Array.isArray(res) ? res[0] : res).id;
      }
      const byName = new Map(products.map(p => [normName(p.name), p.id]));
      const valid = mRows.filter(r => r.title || r.content);
      // 기존 항목은 고쳐 쓰고(제품 연결 유지), 빠진 것만 지운다
      const keep = new Set(valid.filter(r => r.id).map(r => String(r.id)));
      const removed = isEdit
        ? mtItems.filter(i => String(i.meeting_id) === String(meeting.id) && !keep.has(String(i.id))).map(i => i.id)
        : [];
      if (removed.length) await api('meeting_items?id=in.(' + removed.join(',') + ')', { method: 'DELETE' });
      for (const r of valid) {
        const product_id = r.product_id || byName.get(normName(r.title)) || null;
        const rowBody = JSON.stringify({ meeting_id: mId, title: r.title, content: r.content, tags: r.tags, due_date: r.due_date || '', assignee: r.assignee, task_id: r.task_id || null, product_id, status: r.status || '' });
        if (r.id) await api('meeting_items?id=eq.' + r.id, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: rowBody });
        else await api('meeting_items', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: rowBody });
      }
      onClose();
      await onSaved();
    } catch (e) { showToast('저장 실패: ' + e.message, true); }
  }

  async function del() {
    if (!meeting) return;
    if (!confirm('이 기록을 삭제할까요?')) return;
    onClose();
    showToast('삭제 중...');
    try {
      await api('meeting_items?meeting_id=eq.' + meeting.id, { method: 'DELETE' });
      await api('meetings?id=eq.' + meeting.id, { method: 'DELETE' });
      await onSaved();
    } catch (e) { showToast('삭제 실패: ' + e.message, true); }
  }

  const activeTasks = tasks.filter(t => t.status !== 'done');

  return (
    <div className="ovl" style={{ display: 'flex' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="mhd">
          <div>
            <div className="mhd-t">{isEdit ? '기록 수정' : '새 기록'}</div>
            {isEdit && <div className="mhd-s">{meeting.meet_date ? meeting.meet_date.replace(/-/g, '.') : ''}</div>}
          </div>
          <button className="xbtn" onClick={onClose} aria-label="닫기"><Icon name="x" size={20} /></button>
        </div>

        <div className="mbd">
          <div className="two">
            <div className="fg">
              <label className="fl">날짜</label>
              <input className="fi" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="fg">
              <label className="fl">타입</label>
              <select className="fs" value={type} onChange={e => setType(e.target.value)}>
                <option value="meeting">회의</option>
                <option value="call">통화</option>
                <option value="mail">메일</option>
                <option value="memo">메모</option>
                <option value="etc">기타</option>
              </select>
            </div>
          </div>

          <div className="fg">
            <label className="fl">제목 (선택)</label>
            <input className="fi" placeholder="예: 콜라보 방향성 회의" value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div className="fg">
            <label className="fl">참석자</label>
            <input className="fi" placeholder="예: 홍길동 팀장, 김영희 대리" value={attendees} onChange={e => setAtt(e.target.value)} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label className="fl" style={{ margin: 0 }}>항목 목록</label>
              <button className="btn btn-sm" onClick={() => setMRows(prev => [...prev, emptyRow()])}>+ 항목 추가</button>
            </div>
            {mRows.map((row, i) => (
              <div key={row.id || 'n' + i} className="mm-row">
                <input className="fi mm-title" placeholder="타이틀" value={row.title} aria-label="타이틀"
                  onChange={e => updateRow(i, 'title', e.target.value)} />
                <textarea className="fi" rows={2} placeholder="내용" value={row.content} aria-label="내용"
                  onChange={e => updateRow(i, 'content', e.target.value)} />
                <div className="mm-grid">
                  <select className="fi" value={row.product_id || ''} aria-label="제품"
                    onChange={e => updateRow(i, 'product_id', e.target.value ? Number(e.target.value) : null)}>
                    <option value="">제품 연결 없음</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select className="fi" value={row.status || ''} aria-label="상태"
                    onChange={e => updateRow(i, 'status', e.target.value)}>
                    <option value="">상태 없음</option>
                    {P_STATUS.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <input className="fi" placeholder="태그 (쉼표로 구분)" value={row.tags} aria-label="태그"
                    onChange={e => updateRow(i, 'tags', e.target.value)} />
                  <input className="fi" type="date" value={row.due_date} aria-label="마감일"
                    onChange={e => updateRow(i, 'due_date', e.target.value)} />
                  <input className="fi" placeholder="담당자" value={row.assignee} aria-label="담당자"
                    onChange={e => updateRow(i, 'assignee', e.target.value)} />
                  <select className="fi" value={row.task_id || ''} aria-label="연결 태스크"
                    onChange={e => updateRow(i, 'task_id', e.target.value ? parseInt(e.target.value) : null)}>
                    <option value="">연결 태스크 없음</option>
                    {activeTasks.map(t => <option key={t.id} value={t.id}>{t.name.slice(0, 22)}</option>)}
                  </select>
                </div>
                <button className="btn btn-sm mm-del" onClick={() => setMRows(prev => prev.filter((_, idx) => idx !== i))}>
                  <Icon name="x" size={13} /> 항목 삭제
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mft">
          {isEdit && <button className="btn" style={{ display: 'inline-flex', marginRight: 'auto', color: '#E24B4A', borderColor: '#F09595' }} onClick={del}>삭제</button>}
          <button className="btn" onClick={onClose}>취소</button>
          <button className="btn btn-p" onClick={save}>저장</button>
        </div>
      </div>
    </div>
  );
}
