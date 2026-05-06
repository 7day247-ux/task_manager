import React, { useState } from 'react';
import { MT_TYPE } from '../utils/constants';
import MeetingModal from '../components/MeetingModal';

export default function MeetingNotes({ meetings, mtItems, tasks, onReload, showToast }) {
  const [search, setSearch] = useState('');
  const [editMeeting, setEditMeeting] = useState(undefined); // undefined = closed, null = new, obj = edit
  const todayStr = new Date().toISOString().slice(0, 10);

  function printMtDate(ds) {
    ds = String(ds).trim();
    const dms = meetings.filter(m => String(m.meet_date).trim() === ds);
    const thS = 'background:#2C2C2A;color:#fff;padding:6px 10px;text-align:left;font-size:10px;border:1px solid #ccc;';
    const tdS = 'padding:5px 10px;font-size:10px;border:1px solid #e0e0e0;vertical-align:top;';
    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>회의록 ${ds.replace(/-/g, '.')}</title></head><body style="font-family:sans-serif;padding:24px;">`;
    html += `<div style="display:flex;justify-content:space-between;margin-bottom:16px;border-bottom:2px solid #2C2C2A;padding-bottom:10px;"><div style="font-size:16px;font-weight:700;">회의록 — ${ds.replace(/-/g, '.')}</div><div style="font-size:11px;color:#888;">출력일: ${new Date().toLocaleDateString('ko-KR')}</div></div>`;
    dms.forEach(m => {
      const mt = MT_TYPE[m.meet_type] || MT_TYPE.etc;
      const its = mtItems.filter(it => String(it.meeting_id) === String(m.id));
      html += `<div style="margin-bottom:20px;"><div style="font-size:13px;font-weight:600;margin-bottom:8px;">${mt.l}${m.meet_title ? ' — ' + m.meet_title : ''}</div>`;
      if (m.attendees) html += `<div style="font-size:11px;color:#666;margin-bottom:6px;">참석자: ${m.attendees}</div>`;
      if (its.length) {
        html += `<table style="width:100%;border-collapse:collapse;font-size:10px;"><thead><tr><th style="${thS}">타이틀</th><th style="${thS}">내용</th><th style="${thS}">태그</th><th style="${thS}">마감일</th><th style="${thS}">담당자</th></tr></thead><tbody>`;
        its.forEach((it, idx) => {
          html += `<tr style="${idx % 2 ? 'background:#f8f8f6;' : ''}"><td style="${tdS}font-weight:600;">${it.title || ''}</td><td style="${tdS}">${it.content || ''}</td><td style="${tdS}">${it.tags || ''}</td><td style="${tdS}">${it.due_date || ''}</td><td style="${tdS}">${it.assignee || ''}</td></tr>`;
        });
        html += '</tbody></table>';
      } else { html += '<div style="font-size:12px;color:#888;">항목 없음</div>'; }
      html += '</div>';
    });
    html += '<script>window.onload=function(){window.print();}<\/script></body></html>';
    const w = window.open('', '_blank', 'width=800,height=600');
    w.document.write(html); w.document.close();
  }

  // Filter for search
  const ql = search.toLowerCase();
  const filteredItems = search
    ? mtItems.filter(it =>
        (it.title && it.title.toLowerCase().includes(ql)) ||
        (it.tags && it.tags.toLowerCase().includes(ql)) ||
        (it.assignee && it.assignee.toLowerCase().includes(ql)) ||
        (it.content && it.content.toLowerCase().includes(ql))
      )
    : [];

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="pt">회의록 &amp; 메모</div>
          <div className="ps">날짜별 기록 관리</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input className="fi" placeholder="🔍  타이틀, 태그, 담당자 검색..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ width: 260, fontSize: 13 }} />
          <button className="btn btn-p" onClick={() => setEditMeeting(null)}>+ 새 기록</button>
        </div>
      </div>

      {/* Timeline view */}
      {!search && (
        <div id="mt-timeline">
          {!meetings.length ? (
            <div className="mt-empty">기록이 없습니다.<br /><span style={{ fontSize: 12 }}>+ 새 기록으로 추가해보세요</span></div>
          ) : (
            meetings.map(m => {
              const its = mtItems.filter(i => String(i.meeting_id) === String(m.id));
              const mt  = MT_TYPE[m.meet_type] || MT_TYPE.etc;
              const dl  = m.meet_date ? m.meet_date.replace(/-/g, '.') : '-';
              return (
                <div key={m.id} className="mt-grp">
                  <div className="mt-dh">
                    <div className="mt-dlbl">
                      {m.meet_date === todayStr && <span style={{ color: '#4A7C6F', fontWeight: 700 }}>오늘 </span>}
                      {dl}
                    </div>
                    <div className="mt-dl" />
                    <button className="mt-dpdf" onClick={() => printMtDate(m.meet_date)}>📄 PDF</button>
                  </div>
                  <div className="mt-card">
                    <div className="mt-ch">
                      <span className={'mt-tb ' + mt.c}>{mt.l}</span>
                      <span className="mt-ct">{m.meet_title || ''}</span>
                      {m.attendees && <span style={{ fontSize: 11, color: '#9A9590', marginLeft: 8 }}>👥 {m.attendees}</span>}
                      <div className="mt-acts">
                        <button className="btn btn-sm btn-g" onClick={() => setEditMeeting(m)}>수정</button>
                      </div>
                    </div>
                    {its.length ? (
                      <table className="mt-tbl">
                        <thead>
                          <tr>
                            <th style={{ width: '16%' }}>타이틀</th><th style={{ width: '28%' }}>내용</th>
                            <th style={{ width: '16%' }}>태그</th><th style={{ width: '12%' }}>마감일</th>
                            <th style={{ width: '12%' }}>담당자</th><th style={{ width: '16%' }}>연결 태스크</th>
                          </tr>
                        </thead>
                        <tbody>
                          {its.map(item => {
                            const tgs = item.tags ? item.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
                            const lt  = item.task_id ? tasks.find(t => t.id === item.task_id) : null;
                            return (
                              <tr key={item.id}>
                                <td style={{ fontWeight: 500 }}>{item.title || ''}</td>
                                <td style={{ color: '#5A5550' }}>{item.content || ''}</td>
                                <td>{tgs.map((t, i) => <span key={i} className="mt-tag">#{t}</span>)}</td>
                                <td style={{ color: '#9A9590' }}>{item.due_date ? item.due_date.slice(5).replace('-', '.') : ''}</td>
                                <td style={{ color: '#9A9590' }}>{item.assignee || ''}</td>
                                <td>{lt ? <span className="mt-lnk">{lt.name.slice(0, 10)}</span> : ''}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ fontSize: 12, color: '#9A9590', padding: '8px 0' }}>항목이 없습니다.</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Search table view */}
      {search && (
        <div className="ttbl">
          <table>
            <thead>
              <tr>
                <th style={{ width: '11%' }}>날짜</th><th style={{ width: '8%' }}>타입</th>
                <th style={{ width: '16%' }}>타이틀</th><th style={{ width: '26%' }}>내용</th>
                <th style={{ width: '13%' }}>태그</th><th style={{ width: '10%' }}>마감일</th>
                <th style={{ width: '10%' }}>담당자</th><th style={{ width: '6%' }}>연결</th>
              </tr>
            </thead>
            <tbody>
              {!filteredItems.length ? (
                <tr><td colSpan={8} className="empty-r">검색 결과가 없습니다.</td></tr>
              ) : filteredItems.map(item => {
                const m   = meetings.find(x => x.id === item.meeting_id) || {};
                const mt  = MT_TYPE[m.meet_type] || MT_TYPE.etc;
                const tgs = item.tags ? item.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
                const lt  = item.task_id ? tasks.find(t => t.id === item.task_id) : null;
                return (
                  <tr key={item.id}>
                    <td style={{ fontSize: 12, color: '#9A9590' }}>{m.meet_date ? m.meet_date.replace(/-/g, '.') : ''}</td>
                    <td><span className={'mt-tb ' + mt.c} style={{ fontSize: 10, padding: '2px 7px' }}>{mt.l}</span></td>
                    <td style={{ fontWeight: 500 }}>{item.title || ''}</td>
                    <td style={{ color: '#5A5550', fontSize: 12 }}>{item.content || ''}</td>
                    <td>{tgs.map((t, i) => <span key={i} className="mt-tag">#{t}</span>)}</td>
                    <td style={{ fontSize: 12, color: '#9A9590' }}>{item.due_date ? item.due_date.slice(5).replace('-', '.') : ''}</td>
                    <td style={{ fontSize: 12, color: '#9A9590' }}>{item.assignee || ''}</td>
                    <td>{lt ? <span className="mt-lnk" style={{ fontSize: 10 }}>{lt.name.slice(0, 8)}</span> : ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editMeeting !== undefined && (
        <MeetingModal
          meeting={editMeeting}
          mtItems={mtItems}
          tasks={tasks}
          onClose={() => setEditMeeting(undefined)}
          onSaved={async () => { setEditMeeting(undefined); await onReload(); }}
          showToast={showToast}
        />
      )}
    </div>
  );
}
