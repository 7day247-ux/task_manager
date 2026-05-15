import React, { useState, useEffect } from 'react';
import { api } from '../utils/helpers';

function emptyRow() {
  return { id: null, title: '', content: '', tags: '', due_date: '', assignee: '', task_id: null };
}

export default function MeetingModal({ meeting, mtItems, tasks, onClose, onSaved, showToast }) {
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
        ? its.map(it => ({ id: it.id, title: it.title || '', content: it.content || '', tags: it.tags || '', due_date: it.due_date || '', assignee: it.assignee || '', task_id: it.task_id || null }))
        : [emptyRow()]
      );
    } else {
      setDate(new Date().toISOString().slice(0, 10));
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
      if (isEdit) {
        await api('meetings?id=eq.' + meeting.id, {
          method: 'PATCH', headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ meet_date: date, meet_type: type, meet_title: title, attendees }),
        });
        await api('meeting_items?meeting_id=eq.' + meeting.id, { method: 'DELETE' });
      } else {
        const res = await api('meetings', {
          method: 'POST', headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ meet_date: date, meet_type: type, meet_title: title, attendees }),
        });
        mId = (Array.isArray(res) ? res[0] : res).id;
      }
      const valid = mRows.filter(r => r.title || r.content);
      for (const r of valid) {
        await api('meeting_items', {
          method: 'POST', headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ meeting_id: mId, title: r.title, content: r.content, tags: r.tags, due_date: r.due_date || null, assignee: r.assignee, task_id: r.task_id || null }),
        });
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
          <button className="xbtn" onClick={onClose}>✕</button>
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
                <option value="meeting">🤝 회의</option>
                <option value="call">📞 통화</option>
                <option value="mail">📧 메일</option>
                <option value="memo">💡 메모</option>
                <option value="etc">📌 기타</option>
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
              <div key={i} style={{ background: '#FAF9F6', border: '1px solid #E8E4DC', borderRadius: 10, padding: 12, marginBottom: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 8, marginBottom: 8 }}>
                  <input className="fi" placeholder="타이틀" value={row.title} style={{ fontSize: 12, padding: '6px 8px' }}
                    onChange={e => updateRow(i, 'title', e.target.value)} />
                  <input className="fi" placeholder="내용" value={row.content} style={{ fontSize: 12, padding: '6px 8px' }}
                    onChange={e => updateRow(i, 'content', e.target.value)} />
                  <input className="fi" placeholder="태그 (쉼표로 구분)" value={row.tags} style={{ fontSize: 12, padding: '6px 8px' }}
                    onChange={e => updateRow(i, 'tags', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: 8, alignItems: 'center' }}>
                  <input className="fi" type="date" value={row.due_date} style={{ fontSize: 12, padding: '6px 8px' }}
                    onChange={e => updateRow(i, 'due_date', e.target.value)} />
                  <input className="fi" placeholder="담당자" value={row.assignee} style={{ fontSize: 12, padding: '6px 8px' }}
                    onChange={e => updateRow(i, 'assignee', e.target.value)} />
                  <select className="fs" value={row.task_id || ''} style={{ fontSize: 12, padding: '6px 8px' }}
                    onChange={e => updateRow(i, 'task_id', e.target.value ? parseInt(e.target.value) : null)}>
                    <option value="">연결 태스크 없음</option>
                    {activeTasks.map(t => <option key={t.id} value={t.id}>{t.name.slice(0, 22)}</option>)}
                  </select>
                  <button className="btn btn-sm" style={{ color: '#E24B4A', borderColor: '#F09595', padding: '5px 8px' }}
                    onClick={() => setMRows(prev => prev.filter((_, idx) => idx !== i))}>✕</button>
                </div>
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
