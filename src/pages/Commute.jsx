import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Icon from '../components/Icon';
import { api } from '../utils/helpers';

// ─── 구간 정의 ───────────────────────────────────────────
const AM = [
  { k: 'wake',      name: '기상' },
  { k: 'shower',    name: '샤워 끝' },
  { k: 'breakfast', name: '아침밥 끝', optional: true },
  { k: 'hair',      name: '머리 끝' },
  { k: 'makeup',    name: '화장 끝', key: true },
  { k: 'leave',     name: '집 출발' },
  { k: 'suji',      name: '수지구청 도착' },
  { k: 'train',     name: '지하철 출발' },
  { k: 'gangnam',   name: '강남역 하차' },
  { k: 'exit5',     name: '5번 출구' },
  { k: 'signal',    name: '횡단보도 초록불' },
  { k: 'office',    name: '사무실 도착', key: true },
];
const PM = [
  { k: 'eTrain',   name: '지하철 탑승' },
  { k: 'eOff',     name: '지하철 하차' },
  { k: 'eBus',     name: '버스 탑승' },
  { k: 'eBusOff',  name: '버스 하차' },
  { k: 'eHome',    name: '집 도착', key: true },
];

// 메모(10~11월)에서 뽑은 기본 소요시간(분). 같은 구간 기록이 3일 쌓이면 최근 10일 중앙값으로 바뀐다.
const DEFAULT = {
  'wake>shower': 28, 'shower>breakfast': 12, 'breakfast>hair': 13, 'shower>hair': 16,
  'hair>makeup': 8, 'makeup>leave': 7, 'leave>suji': 8,
  'train>gangnam': 27, 'gangnam>exit5': 4, 'signal>office': 3,
  'eTrain>eOff': 27, 'eOff>eBus': 3, 'eBus>eBusOff': 6, 'eBusOff>eHome': 3,
};
// 지하철과 신호등은 시간표처럼 정해진 칸으로 계산한다.
const TRAIN = { anchor: 7 * 60 + 28, every: 5, minWait: 1 };      // 7:28, 7:33, 7:38, 7:43 …
const SIGNAL = { anchor: 8 * 60 + 4, every: 3.5, walk: 1.5 };      // 8:04:00, 8:07:30 … (추정)
const PM_TRAINS = ['18:43', '18:48'];

// ─── 시간 도우미 ─────────────────────────────────────────
const toMin = s => { const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(s || ''); return m ? +m[1] * 60 + +m[2] + (m[3] ? +m[3] / 60 : 0) : null; };
const fmt = m => {
  if (m == null) return '–';
  const s = Math.round(m * 60), h = Math.floor(s / 3600), mi = Math.floor((s % 3600) / 60), se = s % 60;
  return h + ':' + String(mi).padStart(2, '0') + (se ? ':' + String(se).padStart(2, '0') : '');
};
const toInput = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(Math.floor(m % 60)).padStart(2, '0');
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const nextGrid = (t, anchor, every) => anchor + Math.ceil((t - anchor) / every - 1e-9) * every;
const median = a => { const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const dayLabel = ds => { const [y, m, d] = ds.split('-').map(Number); return m + '/' + d + ' ' + DOW[new Date(y, m - 1, d).getDay()]; };

function seqOf(rows, times) {
  return rows.filter(r => !(r.optional && times.noBreakfast)).map(r => r.k);
}

// 기록에서 구간별 소요시간 중앙값을 배운다. 바로 이웃한 두 구간을 모두 적은 날만 쓴다.
function learn(logs) {
  const bag = {};
  logs.slice(0, 40).forEach(l => {
    [AM, PM].forEach(rows => {
      const seq = seqOf(rows, l.times);
      for (let i = 1; i < seq.length; i++) {
        const a = toMin(l.times[seq[i - 1]]), b = toMin(l.times[seq[i]]);
        if (a == null || b == null || b - a <= 0 || b - a > 120) continue;
        const key = seq[i - 1] + '>' + seq[i];
        (bag[key] = bag[key] || []).length < 10 && bag[key].push(b - a);
      }
    });
  });
  const M = {};
  Object.keys(DEFAULT).forEach(k => { M[k] = { v: DEFAULT[k], n: 0 }; });
  Object.keys(bag).forEach(k => { if (bag[k].length >= 3) M[k] = { v: Math.round(median(bag[k])), n: bag[k].length }; });
  return M;
}
const dur = (M, a, b) => (M[a + '>' + b] || { v: 5 }).v;

function step(M, t, a, b) {
  if (b === 'train') return nextGrid(t + TRAIN.minWait, TRAIN.anchor, TRAIN.every);
  if (b === 'signal') return nextGrid(t + SIGNAL.walk, SIGNAL.anchor, SIGNAL.every);
  if (a === 'signal') return Math.floor(t) + dur(M, a, b);
  return t + dur(M, a, b);
}

// 맨 처음 적은 구간부터 뒤 구간을 차례로 계산한다. 적은 구간은 실제 값으로 다시 맞춘다.
function predict(rows, times, M, example) {
  const seq = seqOf(rows, times), out = {};
  let t = null, prev = null;
  seq.forEach((k, i) => {
    const actual = toMin(times[k]);
    const pred = t == null ? null : step(M, t, prev, k);
    if (actual != null) { out[k] = { v: actual, actual: true, pred }; t = actual; }
    else if (t == null && i === 0 && example != null) { out[k] = { v: example, actual: false, pred: null, example: true }; t = example; }
    else if (t != null) { out[k] = { v: pred, actual: false, pred }; t = pred; }
    else out[k] = null;
    prev = k;
  });
  return out;
}
function chainFrom(M, rows, times, fromKey, fromVal) {
  const seq = seqOf(rows, times);
  let t = fromVal;
  for (let i = seq.indexOf(fromKey) + 1; i < seq.length; i++) t = step(M, t, seq[i - 1], seq[i]);
  return t;
}

// ─── 화면 ────────────────────────────────────────────────
export default function Commute({ showToast }) {
  const [logs, setLogs] = useState([]);        // [{log_date, times, entered_at, note}]
  const [loaded, setLoaded] = useState(false);
  const [date, setDate] = useState(todayStr());
  const [mode, setMode] = useState(new Date().getHours() >= 15 ? 'pm' : 'am');
  const [saving, setSaving] = useState(false);
  const queue = useRef(Promise.resolve());

  const load = useCallback(async () => {
    try {
      const d = await api('commute_logs?order=log_date.desc&limit=400');
      setLogs((d || []).map(l => ({ ...l, times: l.times || {}, entered_at: l.entered_at || {} })));
    } catch (e) { showToast('출퇴근 기록을 불러오지 못했어요: ' + e.message, true); }
    setLoaded(true);
  }, [showToast]);
  useEffect(() => { load(); }, [load]);

  const cur = logs.find(l => l.log_date === date) || { log_date: date, times: {}, entered_at: {}, note: '' };
  const history = useMemo(() => logs.filter(l => l.log_date !== date), [logs, date]);
  const M = useMemo(() => learn(history), [history]);

  function save(next) {
    setLogs(ls => {
      const rest = ls.filter(l => l.log_date !== next.log_date);
      return [next, ...rest].sort((a, b) => (a.log_date < b.log_date ? 1 : -1));
    });
    setSaving(true);
    queue.current = queue.current.then(() =>
      api('commute_logs?on_conflict=log_date', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ log_date: next.log_date, times: next.times, entered_at: next.entered_at, note: next.note || '' }),
      }).catch(e => showToast('저장하지 못했어요: ' + e.message, true))
    ).finally(() => setSaving(false));
  }
  function setTime(k, val) {
    const times = { ...cur.times }, entered = { ...cur.entered_at };
    if (val) { times[k] = val; entered[k] = new Date().toISOString(); }
    else { delete times[k]; delete entered[k]; }
    save({ ...cur, times, entered_at: entered });
  }
  function toggleBreakfast() {
    const times = { ...cur.times };
    if (times.noBreakfast) delete times.noBreakfast; else { times.noBreakfast = true; delete times.breakfast; }
    save({ ...cur, times });
  }

  const typicalWake = useMemo(() => {
    const w = history.slice(0, 10).map(l => toMin(l.times.wake)).filter(x => x != null);
    return w.length >= 3 ? median(w) : 6 * 60 + 15;
  }, [history]);
  const amAny = AM.some(r => cur.times[r.k]);
  const pmAny = PM.some(r => cur.times[r.k]);
  const am = predict(AM, cur.times, M, amAny ? null : typicalWake);
  const pm = predict(PM, cur.times, M, pmAny ? null : toMin(PM_TRAINS[0]));

  // 화장 끝 → 사무실: 지난 기록
  const keySpan = useMemo(() => {
    const d = logs.map(l => { const a = toMin(l.times.makeup), b = toMin(l.times.office); return a != null && b != null && b > a ? b - a : null; }).filter(x => x != null);
    return d.length ? { med: Math.round(median(d)), min: Math.min(...d), max: Math.max(...d), n: d.length } : null;
  }, [logs]);

  // 화장을 몇 시까지 끝내야 하나
  const cutRows = useMemo(() => {
    const toTrain = dur(M, 'makeup', 'leave') + dur(M, 'leave', 'suji') + TRAIN.minWait;
    const base = am.train ? am.train.v : TRAIN.anchor + TRAIN.every;
    const rows = [];
    for (let i = -1; i <= 2; i++) {
      const t = base + i * TRAIN.every;
      rows.push({ train: t, makeup: t - toTrain, leave: t - TRAIN.minWait - dur(M, 'leave', 'suji'), office: chainFrom(M, AM, cur.times, 'train', t), on: i === 0 });
    }
    return rows;
  }, [M, am.train, cur.times]);

  const rows = mode === 'am' ? AM : PM;
  const pred = mode === 'am' ? am : pm;
  const goal = mode === 'am' ? am.office : pm.eHome;
  const example = mode === 'am' ? !amAny : !pmAny;

  return (
    <div className="page on cm">
      <div className="ph">
        <div>
          <div className="pt">출퇴근</div>
          <div className="ps">{saving ? '저장 중…' : loaded ? '구간마다 ‘지금’을 누르면 바로 저장돼요' : '불러오는 중…'}</div>
        </div>
        <input type="date" className="cm-date" value={date} onChange={e => setDate(e.target.value || todayStr())} aria-label="날짜" />
      </div>

      <div className="cm-seg" role="tablist">
        <button role="tab" aria-selected={mode === 'am'} className={mode === 'am' ? 'on' : ''} onClick={() => setMode('am')}>출근</button>
        <button role="tab" aria-selected={mode === 'pm'} className={mode === 'pm' ? 'on' : ''} onClick={() => setMode('pm')}>퇴근</button>
      </div>

      <div className="cm-hero">
        <div>
          <div className="cm-hero-lab">
            {goal && goal.actual ? (mode === 'am' ? '사무실 도착' : '집 도착')
              : example ? (mode === 'am' ? fmt(typicalWake) + '에 일어나면 사무실 도착' : '6:43 열차를 타면 집 도착')
              : (mode === 'am' ? '사무실 도착 예상' : '집 도착 예상')}
          </div>
          <div className="cm-hero-big">{goal ? fmt(goal.v) : '–'}</div>
        </div>
        <div className="cm-hero-sub">
          {mode === 'am' && am.train && <>{fmt(am.train.v)} 지하철<br /></>}
          {mode === 'am' && am.makeup && !am.makeup.actual && <>화장 {fmt(am.makeup.v)}까지</>}
          {mode === 'pm' && pm.eBus && <>{fmt(pm.eBus.v)} 버스</>}
        </div>
      </div>

      {mode === 'pm' && (
        <div className="cm-chips">
          {PM_TRAINS.map(t => (
            <button key={t} className={'chip' + (cur.times.eTrain === t ? ' on' : '')} onClick={() => setTime('eTrain', cur.times.eTrain === t ? '' : t)}>
              {fmt(toMin(t))} 열차 탔음
            </button>
          ))}
        </div>
      )}

      <div className="cm-card">
        <ol className="cm-stops">
          {rows.map(r => {
            const skip = r.optional && cur.times.noBreakfast;
            const p = pred[r.k];
            const diff = p && p.actual && p.pred != null ? Math.round(p.v - p.pred) : null;
            return (
              <li key={r.k} className={'cm-stop' + (p && p.actual ? ' done' : '') + (r.key ? ' key' : '') + (skip ? ' skip' : '')}>
                <div className="cm-stop-main">
                  <span className="cm-stop-name">{r.name}</span>
                  <span className="cm-stop-note">
                    {skip ? '오늘은 건너뜀'
                      : diff != null ? (diff === 0 ? '예상과 같음' : '예상보다 ' + Math.abs(diff) + '분 ' + (diff > 0 ? '늦음' : '빠름'))
                      : r.k === 'signal' ? '추정 · 3분 30초마다'
                      : r.k === 'train' ? '5분 간격 시간표'
                      : ''}
                  </span>
                </div>
                <span className={'cm-stop-time' + (p && !p.actual ? ' pred' : '')}>{skip ? '' : p ? fmt(p.v) : '–'}</span>
                {r.optional ? (
                  <div className="cm-stop-act">
                    {!skip && <TimeBox value={cur.times[r.k]} onChange={v => setTime(r.k, v)} label={r.name} />}
                    <button className="cm-skip" onClick={toggleBreakfast}>{skip ? '먹음' : '안 먹음'}</button>
                  </div>
                ) : (
                  <div className="cm-stop-act"><TimeBox value={cur.times[r.k]} onChange={v => setTime(r.k, v)} label={r.name} /></div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {mode === 'am' && (
        <div className="cm-card">
          <div className="cm-h">화장 끝 → 사무실</div>
          {keySpan
            ? <p className="cm-p">보통 <b>{keySpan.med}분</b> 걸렸어요 <span className="cm-mute">({keySpan.n}일 · 가장 빨랐던 날 {keySpan.min}분, 늦었던 날 {keySpan.max}분)</span></p>
            : <p className="cm-p cm-mute">화장 끝과 사무실 도착을 같은 날 적으면 여기에 걸린 시간이 쌓여요.</p>}
          <table className="cm-cut">
            <thead><tr><th>화장 끝</th><th>집 출발</th><th>지하철</th><th>사무실</th></tr></thead>
            <tbody>
              {cutRows.map(r => (
                <tr key={r.train} className={r.on ? 'on' : ''}>
                  <td>{fmt(r.makeup)}</td><td>{fmt(r.leave)}</td><td>{fmt(r.train)}</td><td>{fmt(r.office)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mode === 'pm' && (
        <div className="cm-card">
          <div className="cm-h">메모에서 뽑은 요령</div>
          <ul className="cm-tips">
            <li>버스는 11번이 58-2보다 빨라요. 58-2는 한성아파트에서 오래 서 있어요.</li>
            <li>6:48 열차는 5-1이 붐비고 1-1 쪽이 덜해요.</li>
            <li>6:43 열차 3-3은 판교부터 앉을 수 있었어요.</li>
          </ul>
        </div>
      )}

      <div className="cm-card">
        <div className="cm-h">메모</div>
        <NoteBox key={date} value={cur.note || ''} onSave={v => save({ ...cur, note: v })} />
      </div>

      <History logs={logs} M={M} onPick={d => setDate(d)} />
    </div>
  );
}

// 시간 칸 + ‘지금’ 버튼. 값이 있으면 지우기 버튼을 보여준다.
function TimeBox({ value, onChange, label }) {
  const [v, setV] = useState(value || '');
  useEffect(() => { setV(value || ''); }, [value]);
  if (!value) {
    return (
      <>
        <input type="time" className="cm-time" value={v} aria-label={label + ' 시간'}
          onChange={e => setV(e.target.value)} onBlur={() => v && onChange(v)} />
        <button className="cm-now" onClick={() => onChange(toInput(nowMin()))}>지금</button>
      </>
    );
  }
  return (
    <>
      <input type="time" className="cm-time" value={v} aria-label={label + ' 시간'}
        onChange={e => setV(e.target.value)} onBlur={() => v !== value && onChange(v)} />
      <button className="cm-clear" onClick={() => onChange('')} aria-label={label + ' 지우기'}><Icon name="x" size={14} /></button>
    </>
  );
}

function NoteBox({ value, onSave }) {
  const [v, setV] = useState(value);
  return (
    <textarea className="cm-note" rows={2} value={v} placeholder="예: 11번 버스, 1-1 칸, 신호 놓침"
      onChange={e => setV(e.target.value)} onBlur={() => v !== value && onSave(v)} />
  );
}

function History({ logs, M, onPick }) {
  const list = logs.filter(l => Object.keys(l.times).some(k => k !== 'noBreakfast'));
  const learned = Object.keys(DEFAULT).filter(k => M[k].n);
  return (
    <div className="cm-card">
      <div className="cm-h">날짜별 기록</div>
      {!list.length && <p className="cm-p cm-mute">아직 기록이 없어요. 내일 아침 기상부터 ‘지금’을 눌러보세요.</p>}
      {!!list.length && (
        <div className="cm-scroll">
          <table className="cm-hist">
            <thead><tr><th>날짜</th><th>기상</th><th>화장</th><th>출발</th><th>지하철</th><th>사무실</th><th>퇴근 열차</th><th>집</th></tr></thead>
            <tbody>
              {list.map(l => (
                <tr key={l.log_date} onClick={() => onPick(l.log_date)}>
                  <td>{dayLabel(l.log_date)}</td>
                  {['wake', 'makeup', 'leave', 'train', 'office', 'eTrain', 'eHome'].map(k => <td key={k}>{l.times[k] ? fmt(toMin(l.times[k])) : '·'}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="cm-p cm-mute cm-small">
        {learned.length ? '구간 ' + learned.length + '개는 내 기록 중앙값으로 계산하고, 나머지는 메모에서 뽑은 기본값을 써요.' : '지금은 메모에서 뽑은 기본값으로 계산해요. 같은 구간을 3일 적으면 내 기록으로 바뀌어요.'}
        {' '}각 시간은 입력한 시각도 함께 저장돼요.
      </p>
    </div>
  );
}
