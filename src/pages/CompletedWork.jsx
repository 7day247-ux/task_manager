import React, { useState } from 'react';
import { CAT } from '../utils/constants';
import { fmtDate } from '../utils/helpers';

const FILTERS = [
  { id: 'all', label: '전체' },
  { id: 'pkg', label: '패키지' },
  { id: 'video', label: '영상' },
  { id: 'project', label: '프로젝트' },
  { id: 'general', label: '일반' },
];

export default function CompletedWork({ tasks, onOpenTask }) {
  const done = tasks.filter(t => t.status === 'done');
  const years = [...new Set(done.map(t => t.reqDate ? t.reqDate.slice(0, 4) : new Date().getFullYear() + ''))].sort().reverse();

  const [yr, setYr]       = useState(years[0] || new Date().getFullYear() + '');
  const [compF, setCompF] = useState('all');

  const f = done.filter(t => {
    const y = t.reqDate ? t.reqDate.slice(0, 4) : new Date().getFullYear() + '';
    if (y !== yr) return false;
    return compF === 'all' || t.cat === compF;
  });

  const edits  = f.filter(t => t.ttype === 'edit');
  const te     = f.reduce((s, t) => s + (t.ecnt || 0), 0);
  const ae     = edits.length ? Math.round(te / edits.length * 10) / 10 : 0;
  const pkgCnt = f.filter(t => t.cat === 'pkg').length;
  const vidCnt = f.filter(t => t.cat === 'video').length;

  const mo = Array(12).fill(0);
  f.forEach(t => { const m = t.reqDate ? parseInt(t.reqDate.slice(5, 7)) - 1 : 0; if (m >= 0 && m < 12) mo[m]++; });
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
        <StatCard num={f.length} label="완료 건수" sub={'총 ' + yr + '년'} />
        <StatCard num={edits.length} label="수정 건수" sub={'신규 ' + (f.length - edits.length) + '건'} />
        <StatCard num={te} label="총 수정 횟수" sub={'평균 ' + ae + '회/건'} />
        <div className="scard">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 700 }}>{pkgCnt}</span>
            <span style={{ fontSize: 11, color: '#9A9590' }}>패키지</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 22, fontWeight: 700 }}>{vidCnt}</span>
            <span style={{ fontSize: 11, color: '#9A9590' }}>영상</span>
          </div>
          <div className="scard-sub" style={{ marginTop: 6 }}>건수</div>
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
          {years.length ? years.map(y => <option key={y} value={y}>{y}년</option>) : <option>{new Date().getFullYear()}년</option>}
        </select>
        {FILTERS.map(flt => (
          <button key={flt.id} className={'chip' + (compF === flt.id ? ' on' : '')} onClick={() => setCompF(flt.id)}>
            {flt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="ttbl">
        <table>
          <thead>
            <tr>
              <th style={{ width: '28%' }}>프로젝트명</th>
              <th style={{ width: '9%' }}>유형</th>
              <th style={{ width: '9%' }}>타입</th>
              <th style={{ width: '9%' }}>수정횟수</th>
              <th style={{ width: '12%' }}>요청일</th>
              <th style={{ width: '12%' }}>완료일</th>
              <th style={{ width: '21%' }}>비고</th>
            </tr>
          </thead>
          <tbody>
            {!f.length ? (
              <tr><td colSpan={7} className="empty-r">완료된 태스크가 없습니다.</td></tr>
            ) : f.map(t => {
              const cat = CAT[t.cat] || { l: '', b: '' };
              const tb  = t.ttype === 'edit' ? <span className="bdg b-edt">수정</span> : <span className="bdg b-new">신규</span>;
              return (
                <tr key={t.id} className="row" onClick={() => onOpenTask(t.id)}>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>{t.name}</td>
                  <td><span className={'bdg ' + cat.b}>{cat.l}</span></td>
                  <td>{tb}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{t.ecnt || 0}회</td>
                  <td style={{ fontSize: 12, color: '#9A9590' }}>{fmtDate(t.reqDate)}</td>
                  <td style={{ fontSize: 12, color: '#9A9590' }}>{fmtDate(t.dueDate)}</td>
                  <td style={{ fontSize: 11, color: '#9A9590' }}>{t.note ? t.note.slice(0, 40) + (t.note.length > 40 ? '…' : '') : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
