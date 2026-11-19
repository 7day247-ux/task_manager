import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import ProductModal from '../components/ProductModal';
import { api, today } from '../utils/helpers';
import { P_STATUS, EVENT_KINDS, statusClass, fmtMD, weekday, daysFrom, productHistory } from '../utils/products';

export default function ProductDetail({ meetings, mtItems, products, pEvents, projects, onReload, showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const todayStr = today();
  const p = products.find(x => String(x.id) === String(id));
  const [editOpen, setEditOpen] = useState(false);
  const [sumEdit, setSumEdit] = useState(null);
  const [newEv, setNewEv] = useState({ kind: '감리', event_date: '', memo: '' });
  const [itemEdit, setItemEdit] = useState(null);
  const [busy, setBusy] = useState(false);

  function back() {
    if (window.history.length > 1) navigate(-1);
    else navigate('/meetings');
  }

  if (!p) {
    return (
      <div className="page on pd">
        <button className="pd-back" onClick={() => navigate('/meetings')}><Icon name="back" size={18} /> 회의록</button>
        <div className="mt-empty">{products.length ? '제품을 찾을 수 없어요.' : '불러오는 중…'}</div>
      </div>
    );
  }

  const events = pEvents
    .filter(e => String(e.product_id) === String(p.id))
    .sort((a, b) => (a.event_date || '9999').localeCompare(b.event_date || '9999') || a.id - b.id);
  const history = productHistory(p.id, meetings, mtItems);
  const project = p.project_id ? projects.find(x => x.id === p.project_id) : null;

  async function run(fn) {
    setBusy(true);
    try {
      await fn();
      await onReload();
      return true;
    } catch (e) {
      showToast('저장 실패: ' + e.message, true);
      return false;
    } finally {
      setBusy(false);
    }
  }

  const patchProduct = body => api('products?id=eq.' + p.id, {
    method: 'PATCH', headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ ...body, updated_at: new Date().toISOString() }),
  });

  function setStatus(s) {
    if (s === p.status) return;
    run(() => patchProduct({ status: s }));
  }

  function saveSummary() {
    run(() => patchProduct({ summary: sumEdit.trim() })).then(ok => ok && setSumEdit(null));
  }

  function addEvent() {
    if (!newEv.event_date && !newEv.memo.trim()) { showToast('날짜나 메모를 적어 주세요', true); return; }
    run(() => api('product_events', {
      method: 'POST', headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ product_id: p.id, kind: newEv.kind, event_date: newEv.event_date, memo: newEv.memo.trim(), done: !!newEv.event_date && newEv.event_date <= todayStr }),
    })).then(ok => ok && setNewEv({ kind: newEv.kind, event_date: '', memo: '' }));
  }

  function toggleEvent(e) {
    run(() => api('product_events?id=eq.' + e.id, {
      method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ done: !e.done }),
    }));
  }

  function delEvent(e) {
    if (!confirm(`${e.kind} ${fmtMD(e.event_date)} 일정을 지울까요?`)) return;
    run(() => api('product_events?id=eq.' + e.id, { method: 'DELETE' }));
  }

  function saveItem() {
    const it = itemEdit;
    run(() => api('meeting_items?id=eq.' + it.id, {
      method: 'PATCH', headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ content: it.content, status: it.status }),
    })).then(ok => ok && setItemEdit(null));
  }

  return (
    <div className="page on pd">
      <button className="pd-back" onClick={back}><Icon name="back" size={18} /> 회의록</button>

      <header className="pd-hd">
        <div className="pd-meta">
          {p.line && <span>{p.line}</span>}
          {p.factory && <span>{p.factory}</span>}
          {p.mine && <span className="pb-mine">내 디자인</span>}
        </div>
        <h1 className="pd-name">{p.name}</h1>
        <div className="pd-stat-row" role="group" aria-label="상태 바꾸기">
          {P_STATUS.map(s => (
            <button key={s} disabled={busy} className={'pd-stat' + (p.status === s ? ' on' : '')} aria-pressed={p.status === s} onClick={() => setStatus(s)}>{s}</button>
          ))}
        </div>
      </header>

      <section className="pb-card">
        <div className="pd-sec-hd">
          <span className="pb-sec-t">지금 상황</span>
          {sumEdit === null && <button className="btn btn-sm btn-g" onClick={() => setSumEdit(p.summary || '')}><Icon name="edit" size={13} /> 수정</button>}
        </div>
        {sumEdit === null ? (
          <p className="pd-sum">{p.summary || <span className="cm-mute">아직 적힌 내용이 없어요.</span>}</p>
        ) : (
          <>
            <textarea className="fi" rows={3} value={sumEdit} onChange={e => setSumEdit(e.target.value)} autoFocus />
            <div className="pd-actions">
              <button className="btn btn-sm" onClick={() => setSumEdit(null)}>취소</button>
              <button className="btn btn-sm btn-p" onClick={saveSummary} disabled={busy}>저장</button>
            </div>
          </>
        )}
        {project && <div className="pd-prj"><Icon name="folder" size={13} /> 프로젝트: {project.name}</div>}
      </section>

      <section className="pb-card">
        <div className="pb-sec-t"><Icon name="calendar" size={15} /> 진행 일정</div>
        {events.length === 0 ? (
          <div className="pb-empty-s">시제·시생산·감리 같은 날짜를 아래에서 추가해 보세요.</div>
        ) : (
          <ul className="pd-tl">
            {events.map(e => {
              const late = !e.done && e.event_date && e.event_date < todayStr;
              const dd = e.event_date ? daysFrom(todayStr, e.event_date) : null;
              return (
                <li key={e.id} className={'pd-tl-i' + (e.done ? ' done' : '') + (late ? ' late' : '')}>
                  <button className="pd-tl-dot" onClick={() => toggleEvent(e)} disabled={busy}
                    aria-label={e.kind + (e.done ? ' 완료 취소' : ' 완료로 표시')}>
                    {e.done && <Icon name="check" size={11} stroke={3} />}
                  </button>
                  <div className="pd-tl-main">
                    <div className="pd-tl-top">
                      <span className="pd-tl-k">{e.kind}</span>
                      <span className="pd-tl-d">{e.event_date ? `${fmtMD(e.event_date)} (${weekday(e.event_date)})` : '날짜 미정'}</span>
                      {!e.done && dd !== null && dd >= 0 && <span className="pb-dday">{dd === 0 ? '오늘' : 'D-' + dd}</span>}
                      {late && <span className="pd-late">했나요?</span>}
                    </div>
                    {e.memo && <div className="pd-tl-memo">{e.memo}</div>}
                  </div>
                  <button className="pd-x" onClick={() => delEvent(e)} aria-label={e.kind + ' 일정 삭제'}><Icon name="x" size={14} /></button>
                </li>
              );
            })}
          </ul>
        )}
        <div className="pd-add">
          <select className="fi" value={newEv.kind} onChange={e => setNewEv(v => ({ ...v, kind: e.target.value }))} aria-label="일정 종류">
            {EVENT_KINDS.map(k => <option key={k}>{k}</option>)}
          </select>
          <input className="fi" type="date" value={newEv.event_date} onChange={e => setNewEv(v => ({ ...v, event_date: e.target.value }))} aria-label="날짜" />
          <input className="fi pd-add-memo" placeholder="메모 (선택)" value={newEv.memo} onChange={e => setNewEv(v => ({ ...v, memo: e.target.value }))} />
          <button className="btn btn-p" onClick={addEvent} disabled={busy}><Icon name="plus" size={14} /> 추가</button>
        </div>
        <div className="pb-note">지난 날짜로 추가하면 완료로 들어가요. 동그라미를 눌러 완료를 바꿀 수 있어요.</div>
      </section>

      <section className="pb-card">
        <div className="pb-sec-t"><Icon name="notes" size={15} /> 주차별 회의 기록</div>
        <div className="pb-note" style={{ marginTop: -4, marginBottom: 8 }}>여기서 고치면 회의록에도 같이 바뀌어요.</div>
        {history.length === 0 ? (
          <div className="pb-empty-s">연결된 회의 항목이 없어요.</div>
        ) : (
          <ol className="pd-hist">
            {history.map((h, idx) => {
              const editing = itemEdit && itemEdit.id === h.id;
              return (
                <li key={h.id} className={'pd-h' + (idx === 0 ? ' latest' : '')}>
                  <div className="pd-h-top">
                    <span className="pd-h-d">{fmtMD(h.meeting.meet_date)} ({weekday(h.meeting.meet_date)})</span>
                    <span className="pd-h-m">{h.meeting.meet_title}</span>
                    {h.status && !editing && <span className={statusClass(h.status)}>{h.status}</span>}
                    {!editing && <button className="btn btn-sm btn-g pd-h-edit" onClick={() => setItemEdit({ id: h.id, content: h.content || '', status: h.status || '' })}>수정</button>}
                  </div>
                  {!editing ? (
                    <>
                      {h.title !== p.name && <div className="pd-h-t">“{h.title}”</div>}
                      <div className="pd-h-c">{h.content || <span className="cm-mute">내용 없음</span>}</div>
                    </>
                  ) : (
                    <div className="pd-h-form">
                      <textarea className="fi" rows={3} value={itemEdit.content} onChange={e => setItemEdit(v => ({ ...v, content: e.target.value }))} autoFocus />
                      <select className="fi" value={itemEdit.status} onChange={e => setItemEdit(v => ({ ...v, status: e.target.value }))} aria-label="그 회의 시점의 상태">
                        <option value="">상태 없음</option>
                        {P_STATUS.map(s => <option key={s}>{s}</option>)}
                      </select>
                      <div className="pd-actions">
                        <button className="btn btn-sm" onClick={() => setItemEdit(null)}>취소</button>
                        <button className="btn btn-sm btn-p" onClick={saveItem} disabled={busy}>저장</button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <button className="btn pd-edit-all" onClick={() => setEditOpen(true)}><Icon name="edit" size={14} /> 제품 정보 수정</button>

      {editOpen && (
        <ProductModal
          product={p}
          projects={projects}
          onClose={() => setEditOpen(false)}
          onSaved={async () => { setEditOpen(false); await onReload(); }}
          onDeleted={async () => { setEditOpen(false); await onReload(); navigate('/meetings', { replace: true }); }}
          showToast={showToast}
        />
      )}
    </div>
  );
}
