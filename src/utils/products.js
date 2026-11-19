// 회의록 → 제품별 트래커에서 쓰는 상수와 계산

export const P_STATUS = ['진행', '확정', '검토', '대기', '보류', '무산', '완료'];
export const P_CLOSED = ['무산', '완료'];
export const P_LINES = ['빙과', '건과', 'IP'];
export const EVENT_KINDS = ['킥오프', '시제', '시생산', '본생산', '감리', '디자인 검수', '데이터 출고', '출시', '미팅', '회신', '견적', '계약', '기타'];

const STATUS_ORDER = { 확정: 0, 진행: 1, 검토: 2, 대기: 3, 보류: 4, 완료: 5, 무산: 6 };

export function statusClass(s) {
  return 'pst pst-' + ({ 진행: 'go', 확정: 'ok', 검토: 'rv', 대기: 'wt', 보류: 'hd', 무산: 'dr', 완료: 'dn' }[s] || 'wt');
}

export function fmtMD(d) {
  if (!d) return '';
  const [, m, dd] = String(d).split('-');
  return Number(m) + '.' + Number(dd);
}

const WD = ['일', '월', '화', '수', '목', '금', '토'];
export function weekday(d) {
  const t = new Date(d + 'T00:00:00');
  return isNaN(t) ? '' : WD[t.getDay()];
}

export function daysFrom(todayStr, d) {
  return Math.round((new Date(d + 'T00:00:00') - new Date(todayStr + 'T00:00:00')) / 86400000);
}

// 제품에 연결된 회의 항목을 최신 회의부터
export function productHistory(productId, meetings, items) {
  const mById = new Map(meetings.map(m => [String(m.id), m]));
  return items
    .filter(i => String(i.product_id) === String(productId))
    .map(i => ({ ...i, meeting: mById.get(String(i.meeting_id)) || {} }))
    .sort((a, b) => String(b.meeting.meet_date || '').localeCompare(String(a.meeting.meet_date || '')) || (b.id - a.id));
}

export function meetingDates(meetings) {
  return [...new Set(meetings.map(m => m.meet_date).filter(Boolean))].sort().reverse();
}

// 선택한 날짜의 회의를 같은 이름의 지난 회의와 비교
export function weeklyDigest(dateStr, meetings, items, products) {
  const pById = new Map(products.map(p => [String(p.id), p]));
  const mById = new Map(meetings.map(m => [String(m.id), m]));
  const dayMeetings = meetings.filter(m => m.meet_date === dateStr);
  const dayIds = new Set(dayMeetings.map(m => String(m.id)));
  const dayItems = items.filter(i => dayIds.has(String(i.meeting_id)) && i.product_id);
  const dayProductIds = new Set(dayItems.map(i => String(i.product_id)));

  // 제품별로 이 날짜 이전 가장 최근 항목
  function prevItemOf(pid) {
    let best = null;
    for (const it of items) {
      if (String(it.product_id) !== pid) continue;
      const m = mById.get(String(it.meeting_id));
      if (!m || !(m.meet_date < dateStr)) continue;
      if (!best || m.meet_date > best.meeting.meet_date) best = { ...it, meeting: m };
    }
    return best;
  }

  const seen = new Set();
  const changes = [];
  for (const it of dayItems) {
    const pid = String(it.product_id);
    if (seen.has(pid)) continue;
    seen.add(pid);
    const product = pById.get(pid);
    if (!product) continue;
    const prev = prevItemOf(pid);
    let type = 'update';
    if (!prev) type = 'new';
    else if (it.status && prev.status && it.status !== prev.status) type = 'status';
    changes.push({ type, product, item: it, prev, from: prev ? prev.status : '', to: it.status });
  }

  const compared = [];
  const missing = [];
  for (const dm of dayMeetings) {
    const prevM = meetings
      .filter(m => m.meet_title === dm.meet_title && m.meet_date < dateStr)
      .sort((a, b) => b.meet_date.localeCompare(a.meet_date))[0];
    if (!prevM) continue;
    compared.push({ title: dm.meet_title, prevDate: prevM.meet_date });
    for (const it of items) {
      if (String(it.meeting_id) !== String(prevM.id) || !it.product_id) continue;
      const pid = String(it.product_id);
      if (dayProductIds.has(pid) || seen.has('m' + pid)) continue;
      const product = pById.get(pid);
      if (!product || P_CLOSED.includes(product.status)) continue;
      seen.add('m' + pid);
      missing.push({ type: 'missing', product, meetTitle: dm.meet_title });
    }
  }

  const rank = { status: 0, new: 1, update: 2 };
  changes.sort((a, b) => rank[a.type] - rank[b.type]);
  return { date: dateStr, meetings: dayMeetings, compared, changes, missing };
}

export function sortProducts(list, items, meetings) {
  const mById = new Map(meetings.map(m => [String(m.id), m]));
  const last = new Map();
  for (const it of items) {
    if (!it.product_id) continue;
    const d = (mById.get(String(it.meeting_id)) || {}).meet_date || '';
    const k = String(it.product_id);
    if (!last.has(k) || d > last.get(k)) last.set(k, d);
  }
  return [...list].sort((a, b) =>
    (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9) ||
    (last.get(String(b.id)) || '').localeCompare(last.get(String(a.id)) || '') ||
    a.name.localeCompare(b.name, 'ko')
  );
}

export function nextEvent(productId, events, todayStr) {
  return events
    .filter(e => String(e.product_id) === String(productId) && !e.done && e.event_date && e.event_date >= todayStr)
    .sort((a, b) => a.event_date.localeCompare(b.event_date))[0] || null;
}

export function normName(s) {
  return String(s || '').replace(/[\s·,()/]/g, '').toLowerCase();
}

// 마지막으로 무산(드롭)된 회의와 그 이유. 회의 기록이 없으면 직접 바꾼 날짜(dropped_at)
export function dropInfo(product, meetings, items) {
  const hist = productHistory(product.id, meetings, items).slice().reverse(); // 오래된 것부터
  let start = null;
  let everDropped = false;
  for (const h of hist) {
    if (h.status === '무산') {
      everDropped = true;
      if (!start) start = h;
    } else if (h.status) {
      start = null;
    }
  }
  const isDropped = product.status === '무산';
  if (isDropped) {
    if (start && (!product.dropped_at || product.dropped_at <= start.meeting.meet_date)) {
      return { dropped: true, date: start.meeting.meet_date, where: start.meeting.meet_title, reason: start.content || '' };
    }
    return { dropped: true, date: product.dropped_at || '', where: '', reason: product.summary || '' };
  }
  return { dropped: false, revived: everDropped };
}
