import React, { useState } from 'react';
import { CAT, EVENT_TYPE } from '../utils/constants';
import { fmtDate, leadDays, fmtLead } from '../utils/helpers';

const FILTERS = [
  { id: 'all', label: '전체' },
  { id: 'pkg', label: '패키지' },
  { id: 'inhouse', label: '사내 디자인' },
  { id: 'posm', label: 'POSM' },
  { id: 'project', label: '프로젝트' },
  { id: 'general', label: '일반' },
];

const TTYPE = { new: ['신규', 'b-new'], edit: ['수정', 'b-edt'], variation: ['베리에이션', 'b-new'] };
const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10 : null;
const fmtAvg = v => v === null ? '—' : v === 0 ? '당일' : v + '일';

export default function CompletedWork({ tasks, events = [], onOpenTask }) {
  const done = tasks.filter(t => t.status === 'done');
  // 완료일 기준으로 연도·월을 나눈다. 완료일이 없는 예전 기록은 요청일로 대신한다.
  const baseDate = t => t.doneDate || t.reqDate || '';
  const thisYear = new Date().getFullYear() + '';
  const years = [...new Set(done.map(t => baseDate(t).slice(0, 4) || thisYear))].sort().reverse();

  const [yr, setYr]       = useState(years[0] || thisYear);
  const [compF, setCompF] = useState('all');

  const inYear = done.filter(t => (baseDate(t).slice(0, 4) || thisYear) === yr);
  const f = inYear
    .filter(t => compF === 'all' || t.cat === compF)
    .sort((a, b) => baseDate(b).localeCompare(baseDate(a)));

  const leads     = f.map(leadDays).filter(v => v !== null);
  const asapTasks = f.filter(t => t.asap);
  const asapLeads = asapTasks.map(leadDays).filter(v => v !== null);
  const normLeads = f.filter(t => !t.asap).map(leadDays).filter(v => v !== null);
  const totalEdits = f.reduce((s, t) => s + (t.ecnt || 0), 0);
  const avgEdits   = f.length ? Math.round(totalEdits / f.length * 10) / 10 : 0;
  const editTasks  = f.filter(t => t.ttype === 'edit').length;

  // 유형별 요약 (연도 전체 기준, 필터와 무관)
  const byCat = Object.keys(CAT).map(k => {
    const list = inYear.filter(t => t.cat === k);
    const l = list.map(leadDays).filter(v => v !== null);
    return { k, n: list.length, lead: avg(l), edits: list.length ? Math.round(list.reduce((s, t) => s + (t.ecnt || 0), 0) / list.length * 10) / 10 : 0 };
  }).filter(r => r.n > 0);
  const maxLead = Math.max(1, ...byCat.map(r => r.lead || 0));

  const evCnt = {};
  events.forEach(e => { if (String(e.event_date).slice(0, 4) === yr) evCnt[e.event_type] = (evCnt[e.event_type] || 0) + 1; });

  const mo = Array(12).fill(0);
  f.forEach(t => { const m = parseInt(baseDate(t).slice(5, 7)) - 1; if (m >= 0 && m < 12) mo[m]++; });
  const mx = Math.max(...mo) || 1;

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="pt">완료 현황</div>
          <div className="ps">업무 실적 &amp; 통계</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="sg">
        <StatCard num={f.length} label="완료 건수" sub={'신규 ' + (f.length - editTasks) + ' · 수정 ' + editTasks} />
        <StatCard num={fmtAvg(avg(leads))} label="평균 리드타임" sub="요청일 → 완료일" />
        <StatCard num={fmtAvg(avg(asapLeads))} label="ASAP 평균 리드타임" sub={'ASAP ' + asapTasks.length + '건 · 일반 ' + fmtAvg(avg(normLeads))} />
        <StatCard num={avgEdits + '회'} label="평균 수정 횟수" sub={'총 ' + totalEdits + '회'} />
      </div>

      {/* Lead time by category */}
      {byCat.length > 0 && (
        <div className="bar-sec">
          <div className="bar-ttl">유형별 리드타임</div>
          <div className="lt-tbl">
            <div className="lt-row lt-hd">
              <span>유형</span><span>건수</span><span>평균 리드타임</span><span>평균 수정</span>
            </div>
            {byCat.map(r => (
              <div key={r.k} className="lt-row">
                <span className="lt-cat">{CAT[r.k].i} {CAT[r.k].l}</span>
                <span>{r.n}건</span>
                <span className="lt-lead">
                  <span className="lt-bar"><span style={{ width: Math.round((r.lead || 0) / maxLead * 100) + '%' }} /></span>
                  <b>{fmtAvg(r.lead)}</b>
                </span>
                <span>{r.edits}회</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity counts (calendar events) */}
      <div className="act-sec">
        <div className="bar-ttl">{yr}년 활동 횟수</div>
        <div className="act-row">
          {Object.entries(EVENT_TYPE).map(([k, m]) => (
            <div key={k} className="act-i">
              <div className="act-num">{evCnt[k] || 0}</div>
              <div className="act-lbl">{m.i} {m.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      <div className="bar-sec">
        <div className="bar-ttl">월별 완료 건수</div>
        <div className="bar-wrap">
          {mo.map((v, i) => (
            <div key={i} className="bar-col">
              <div className="bar-val">{v}</div>
              <div className="bar-fill" style={{ height: Math.round(v / mx * 100) + '%', background: '#4A7C6F' }} />
              <div className="bar-lbl">{i + 1}월</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="fs" value={yr} onChange={e => setYr(e.target.value)}
          style={{ width: 'auto', padding: '5px 10px', fontSize: 12, borderRadius: 20 }}>
          {years.length ? years.map(y => <option key={y} value={y}>{y}년</option>) : <option>{thisYear}년</option>}
        </select>
        {FILTERS.map(flt => (
          <button key={flt.id} className={'chip' + (compF === flt.id ? ' on' : '')} onClick={() => setCompF(flt.id)}>
            {flt.label}
          </button>
        ))}
      </div>

      {/* Table (desktop) */}
      <div className="ttbl cw-table">
        <table>
          <thead>
            <tr>
              <th style={{ width: '27%' }}>프로젝트명</th>
              <th style={{ width: '10%' }}>유형</th>
              <th style={{ width: '9%' }}>타입</th>
              <th style={{ width: '9%' }}>요청일</th>
              <th style={{ width: '9%' }}>완료일</th>
              <th style={{ width: '9%' }}>리드타임</th>
              <th style={{ width: '8%' }}>수정</th>
              <th style={{ width: '19%' }}>비고</th>
            </tr>
          </thead>
          <tbody>
            {!f.length ? (
              <tr><td colSpan={8} className="empty-r">완료된 태스크가 없습니다.</td></tr>
            ) : f.map(t => {
              const cat = CAT[t.cat] || { l: '', b: '' };
              const tt  = TTYPE[t.ttype] || TTYPE.new;
              return (
                <tr key={t.id} className="row" onClick={() => onOpenTask(t.id)}>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>{t.name}{t.asap && <span className="asap-tag">ASAP</span>}</td>
                  <td><span className={'bdg ' + cat.b}>{cat.l}</span></td>
                  <td><span className={'bdg ' + tt[1]}>{tt[0]}</span></td>
                  <td style={{ fontSize: 12, color: '#9A9590' }}>{fmtDate(t.reqDate)}</td>
                  <td style={{ fontSize: 12, color: '#9A9590' }}>{fmtDate(t.doneDate)}</td>
                  <td style={{ fontWeight: 600 }}>{fmtLead(leadDays(t))}</td>
                  <td style={{ fontWeight: 600 }}>{t.ecnt || 0}회</td>
                  <td style={{ fontSize: 11, color: '#9A9590' }}>{t.note ? t.note.slice(0, 40) + (t.note.length > 40 ? '…' : '') : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards (mobile) */}
      <div className="cw-cards">
        {!f.length ? (
          <div className="empty-r">완료된 태스크가 없습니다.</div>
        ) : f.map(t => {
          const cat = CAT[t.cat] || { l: '', b: '' };
          return (
            <div key={t.id} className="cw-card" onClick={() => onOpenTask(t.id)}>
              <div className="cw-card-top">
                <span className="cw-card-name">{t.name}</span>
                <span className={'bdg ' + cat.b}>{cat.l}</span>
              </div>
              <div className="cw-card-meta">
                <span>{fmtDate(t.reqDate)} → {fmtDate(t.doneDate)}</span>
                {t.asap && <span className="asap-tag">ASAP</span>}
              </div>
              <div className="cw-card-nums">
                <span>리드타임 <b>{fmtLead(leadDays(t))}</b></span>
                <span>수정 <b>{t.ecnt || 0}회</b></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ num, label, sub }) {
  return (
    <div className="scard">
      <div className="scard-num">{num}</div>
      <div className="scard-lbl">{label}</div>
      <div className="scard-sub">{sub}</div>
    </div>
  );
}
