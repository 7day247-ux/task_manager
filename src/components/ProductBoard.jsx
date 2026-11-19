import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { api, today } from '../utils/helpers';
import {
  P_LINES, P_CLOSED, statusClass, fmtMD, weekday, daysFrom,
  meetingDates, weeklyDigest, sortProducts, nextEvent, dropInfo,
} from '../utils/products';

const FILTERS = [
  { id: 'all', l: '전체' },
  { id: 'mine', l: '내 디자인' },
  ...P_LINES.map(l => ({ id: l, l })),
  { id: 'drop', l: '드롭' },
];

const BRIEF_LIMIT = 6;

export default function ProductBoard({ meetings, mtItems, products, pEvents, onReload, showToast, onNewProduct }) {
  const navigate = useNavigate();
  const todayStr = today();
  const dates = useMemo(() => meetingDates(meetings), [meetings]);
  const [week, setWeek] = useState(null);
  const curWeek = week && dates.includes(week) ? week : dates[0];
  const [filter, setFilter] = useState(() => {
    try { return sessionStorage.getItem('pb-filter') || 'all'; } catch { return 'all'; }
  });
  const [q, setQ] = useState('');
  const [showAllBrief, setShowAllBrief] = useState(false);
  const [showClosed, setShowClosed] = useState(false);

  const digest = useMemo(
    () => (curWeek ? weeklyDigest(curWeek, meetings, mtItems, products) : null),
    [curWeek, meetings, mtItems, products]
  );
  const latestDigest = useMemo(
    () => (dates[0] ? weeklyDigest(dates[0], meetings, mtItems, products) : null),
    [dates, meetings, mtItems, products]
  );
  const marks = useMemo(() => {
    const m = new Map();
    (latestDigest ? latestDigest.changes : []).forEach(c => m.set(String(c.product.id), c.type));
    return m;
  }, [latestDigest]);

  const pById = useMemo(() => new Map(products.map(p => [String(p.id), p])), [products]);
  const upcoming = pEvents
    .filter(e => !e.done && e.event_date && e.event_date >= todayStr && daysFrom(todayStr, e.event_date) <= 14)
    .sort((a, b) => a.event_date.localeCompare(b.event_date));
  const overdue = pEvents
    .filter(e => !e.done && e.event_date && e.event_date < todayStr)
    .sort((a, b) => b.event_date.localeCompare(a.event_date));

  function pickFilter(f) {
    setFilter(f);
    try { sessionStorage.setItem('pb-filter', f); } catch { /* 저장 안 돼도 괜찮음 */ }
  }

  async function markDone(ev) {
    try {
      await api('product_events?id=eq.' + ev.id, {
        method: 'PATCH', headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ done: true }),
      });
      await onReload();
    } catch (e) { showToast('저장 실패: ' + e.message, true); }
  }

  const ql = q.trim().toLowerCase();
  const dropMap = new Map(products.map(p => [String(p.id), dropInfo(p, meetings, mtItems)]));
  const dropped = products
    .filter(p => p.status === '무산')
    .map(p => ({ p, d: dropMap.get(String(p.id)) }))
    .filter(x => !ql || x.p.name.toLowerCase().includes(ql))
    .sort((a, b) => (b.d.date || '').localeCompare(a.d.date || ''));
  const revived = products.filter(p => p.status !== '무산' && dropMap.get(String(p.id)).revived);
  const visible = products.filter(p => {
    if (p.status === '무산') return false;
    if (filter === 'mine' && !p.mine) return false;
    if (P_LINES.includes(filter) && p.line !== filter) return false;
    if (ql && !(p.name.toLowerCase().includes(ql) || (p.summary || '').toLowerCase().includes(ql))) return false;
    return true;
  });
  const sorted = sortProducts(visible, mtItems, meetings);
  const open = sorted.filter(p => !P_CLOSED.includes(p.status));
  const closed = sorted.filter(p => p.status === '완료');
  const groups = filter === 'all' && !ql
    ? P_LINES.map(l => ({ l, list: open.filter(p => p.line === l) })).concat([{ l: '기타', list: open.filter(p => !P_LINES.includes(p.line)) }])
    : [{ l: '', list: open }];

  const go = id => navigate('/meetings/p/' + id);

  const briefRows = digest ? digest.changes : [];
  const shownBrief = showAllBrief ? briefRows : briefRows.slice(0, BRIEF_LIMIT);
  const cnt = t => briefRows.filter(c => c.type === t).length;

  return (
    <div className="pb">
      <div className="pb-side">
      {digest && (
        <section className="pb-card pb-brief">
          <div className="pb-brief-hd">
            <div>
              <div className="pb-eyebrow">주간 업데이트</div>
              <div className="pb-brief-ttl">{fmtMD(curWeek)} ({weekday(curWeek)}) 회의</div>
              <div className="pb-brief-sub">
                {digest.meetings.map(m => m.meet_title).filter(Boolean).join(' · ') || '회의'}
                {digest.compared.length > 0 && <> — {fmtMD(digest.compared[0].prevDate)} 대비</>}
              </div>
            </div>
          </div>
          {dates.length > 1 && (
            <div className="pb-weeks" role="tablist" aria-label="회의 날짜">
              {dates.slice(0, 8).map(d => (
                <button key={d} role="tab" aria-selected={d === curWeek}
                  className={'pb-week' + (d === curWeek ? ' on' : '')}
                  onClick={() => { setWeek(d); setShowAllBrief(false); }}>
                  {fmtMD(d)}
                </button>
              ))}
            </div>
          )}
          <div className="pb-counts">
            <span><b>{cnt('status')}</b>상태 바뀜</span>
            <span><b>{cnt('new')}</b>새로 생김</span>
            <span><b>{cnt('update')}</b>업데이트</span>
            {digest.missing.length > 0 && <span><b>{digest.missing.length}</b>언급 없음</span>}
          </div>
          {briefRows.length === 0 ? (
            <div className="pb-empty-s">이 날짜에 제품과 연결된 항목이 없어요.</div>
          ) : (
            <ul className="pb-chg">
              {shownBrief.map(c => (
                <li key={c.product.id}>
                  <button className="pb-chg-row" onClick={() => go(c.product.id)}>
                    <span className={'pb-chg-tag t-' + c.type}>
                      {c.type === 'status' ? '상태' : c.type === 'new' ? '신규' : '업데이트'}
                    </span>
                    <span className="pb-chg-main">
                      <span className="pb-chg-name">{c.product.name}</span>
                      {c.type === 'status'
                        ? <span className="pb-chg-txt">{c.from} → <b>{c.to}</b>{c.item.content ? ' · ' + c.item.content : ''}</span>
                        : <span className="pb-chg-txt">{c.item.content || '내용 없음'}</span>}
                    </span>
                    <Icon name="chev" size={16} className="pb-chev" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {briefRows.length > BRIEF_LIMIT && (
            <button className="pb-more" onClick={() => setShowAllBrief(v => !v)}>
              {showAllBrief ? '접기' : `${briefRows.length - BRIEF_LIMIT}개 더 보기`}
            </button>
          )}
          {digest.missing.length > 0 && (
            <div className="pb-missing">
              <span className="pb-missing-l">지난 회의엔 있었는데 이번엔 언급 없음</span>
              <div className="pb-missing-list">
                {digest.missing.map(m => (
                  <button key={m.product.id} className="pb-pill" onClick={() => go(m.product.id)}>{m.product.name}</button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {(upcoming.length > 0 || overdue.length > 0) && (
        <section className="pb-card">
          <div className="pb-sec-t"><Icon name="calendar" size={15} /> 일정</div>
          {overdue.length > 0 && (
            <>
              <div className="pb-sub-l">날짜 지남 · 했는지 체크해 주세요</div>
              <ul className="pb-evs">
                {overdue.slice(0, 5).map(e => {
                  const p = pById.get(String(e.product_id));
                  return (
                    <li key={e.id} className="pb-ev late">
                      <span className="pb-ev-d">{fmtMD(e.event_date)}</span>
                      <button className="pb-ev-main" onClick={() => p && go(p.id)}>
                        <span className="pb-ev-k">{e.kind}</span> {p ? p.name : ''}
                      </button>
                      <button className="pb-ev-ok" onClick={() => markDone(e)} aria-label={(p ? p.name + ' ' : '') + e.kind + ' 완료'}>
                        <Icon name="check" size={14} /> 완료
                      </button>
                    </li>
                  );
                })}
              </ul>
              {overdue.length > 5 && <div className="pb-note">외 {overdue.length - 5}건 — 제품 화면에서 확인할 수 있어요.</div>}
            </>
          )}
          {upcoming.length > 0 && (
            <>
              <div className="pb-sub-l">다가오는 2주</div>
              <ul className="pb-evs">
                {upcoming.map(e => {
                  const p = pById.get(String(e.product_id));
                  const dd = daysFrom(todayStr, e.event_date);
                  return (
                    <li key={e.id} className="pb-ev">
                      <span className="pb-ev-d">{fmtMD(e.event_date)}<small>{weekday(e.event_date)}</small></span>
                      <button className="pb-ev-main" onClick={() => p && go(p.id)}>
                        <span className="pb-ev-k">{e.kind}</span> {p ? p.name : ''}
                      </button>
                      <span className="pb-dday">{dd === 0 ? '오늘' : 'D-' + dd}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
      )}

      </div>

      <div className="pb-main">
      <div className="pb-tools">
        <div className="pb-filters">
          {FILTERS.map(f => (
            <button key={f.id} className={'chip' + (filter === f.id ? ' on' : '')} onClick={() => pickFilter(f.id)}>{f.l}</button>
          ))}
        </div>
        <div className="pb-search">
          <input className="fi" placeholder="제품 검색" value={q} onChange={e => setQ(e.target.value)} />
          <button className="btn" onClick={onNewProduct}><Icon name="plus" size={14} /><span className="hide-mobile">제품</span></button>
        </div>
      </div>

      {filter === 'drop' && (
        <section className="pb-group">
          <div className="pb-group-hd"><span>드롭된 제품</span><span className="pb-group-n">{dropped.length}</span></div>
          {dropped.length === 0 ? <div className="mt-empty">드롭된 제품이 없어요.</div> : (
            <div className="pb-list">
              {dropped.map(({ p, d }) => (
                <button key={p.id} className="pb-row" onClick={() => go(p.id)}>
                  <span className="pb-drop-d">
                    {d.date ? <>{fmtMD(d.date)}<small>{d.date.slice(0, 4)}</small></> : <small>날짜 없음</small>}
                  </span>
                  <span className="pb-row-main">
                    <span className="pb-row-name">{p.name}<span className="pb-line">{p.line}</span></span>
                    {d.reason && <span className="pb-row-sum">{d.reason}</span>}
                    {d.where && <span className="pb-row-where">{d.where}에서 최종 드롭</span>}
                  </span>
                </button>
              ))}
            </div>
          )}
          {revived.length > 0 && (
            <div className="pb-missing" style={{ borderTop: 0, marginTop: 14 }}>
              <span className="pb-missing-l">드롭됐다가 다시 살아난 제품</span>
              <div className="pb-missing-list">
                {revived.map(p => <button key={p.id} className="pb-pill" onClick={() => go(p.id)}>{p.name} · {p.status}</button>)}
              </div>
            </div>
          )}
        </section>
      )}

      {filter !== 'drop' && groups.map(g => g.list.length > 0 && (
        <section key={g.l || 'all'} className="pb-group">
          {g.l && <div className="pb-group-hd"><span>{g.l}</span><span className="pb-group-n">{g.list.length}</span></div>}
          <div className="pb-list">
            {g.list.map(p => <ProductRow key={p.id} p={p} mark={marks.get(String(p.id))} next={nextEvent(p.id, pEvents, todayStr)} onOpen={() => go(p.id)} />)}
          </div>
        </section>
      ))}
      {filter !== 'drop' && !open.length && !closed.length && (
        <div className="mt-empty">해당하는 제품이 없어요.</div>
      )}

      {filter !== 'drop' && dropped.length > 0 && (
        <button className="pb-closed-t" onClick={() => pickFilter('drop')}>
          드롭된 제품 {dropped.length}개 보기 <Icon name="chev" size={14} />
        </button>
      )}
      {filter !== 'drop' && closed.length > 0 && (
        <section className="pb-group">
          <button className="pb-closed-t" onClick={() => setShowClosed(v => !v)} aria-expanded={showClosed}>
            완료 {closed.length}개 <Icon name="down" size={14} style={{ transform: showClosed ? 'rotate(180deg)' : 'none' }} />
          </button>
          {showClosed && (
            <div className="pb-list">
              {closed.map(p => <ProductRow key={p.id} p={p} mark={marks.get(String(p.id))} onOpen={() => go(p.id)} />)}
            </div>
          )}
        </section>
      )}
      </div>
    </div>
  );
}

function ProductRow({ p, mark, next, onOpen }) {
  return (
    <button className="pb-row" onClick={onOpen}>
      <span className="pb-row-main">
        <span className="pb-row-name">
          {mark && <span className={'pb-dot t-' + mark} aria-label={mark === 'new' ? '이번 주 신규' : '이번 주 변경'} />}
          {p.name}
          {p.mine && <span className="pb-mine">내 디자인</span>}
        </span>
        {p.summary && <span className="pb-row-sum">{p.summary}</span>}
        {next && <span className="pb-row-next"><Icon name="calendar" size={11} /> {fmtMD(next.event_date)} {next.kind}</span>}
      </span>
      <span className={statusClass(p.status)}>{p.status}</span>
    </button>
  );
}
