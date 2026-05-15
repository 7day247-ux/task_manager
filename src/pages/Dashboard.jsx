import React, { useEffect, useRef } from 'react';
import { STATUS, CAT } from '../utils/constants';
import { fmtDate, pct, getDdayInfo } from '../utils/helpers';

function DonutCard({ id, label, percent, color, desc, onClick }) {
  const fillRef = useRef(null);
  const C = 2 * Math.PI * 35;

  useEffect(() => {
    const el = fillRef.current;
    if (!el) return;
    const timer = setTimeout(() => {
      el.style.strokeDasharray = C;
      el.style.strokeDashoffset = C - (percent / 100) * C;
      el.setAttribute('stroke', color);
    }, 200);
    return () => clearTimeout(timer);
  }, [percent, color, C]);

  return (
    <div className="dc-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="dc-lbl">{label}</div>
      <div className="donut-w">
        <svg className="donut-svg" viewBox="0 0 90 90">
          <circle className="donut-bg" cx="45" cy="45" r="35" />
          <circle ref={fillRef} className="donut-fill" cx="45" cy="45" r="35" stroke={color} />
        </svg>
        <div className="donut-num">{percent}%</div>
      </div>
      <div className="dc-desc">{desc}</div>
    </div>
  );
}

export default function Dashboard({ tasks, onGoTaskFilter }) {
  const now    = new Date();
  const days   = ['일', '월', '화', '수', '목', '금', '토'];
  const dateStr = (now.getMonth() + 1) + '월 ' + now.getDate() + '일 ' + days[now.getDay()] + '요일';

  const inprog  = tasks.filter(t => t.status === 'inprogress');
  const active  = tasks.filter(t => t.status !== 'done');
  const hold    = tasks.filter(t => t.status === 'hold');
  const asapAll = tasks.filter(t => t.asap);
  const asapDone = tasks.filter(t => t.asap && t.status === 'done');

  const p1 = inprog.length ? Math.round(inprog.reduce((s, t) => s + pct(t), 0) / inprog.length) : 0;
  const p2 = active.length ? Math.round(hold.length / active.length * 100) : 0;
  const p3 = asapAll.length ? Math.round(asapDone.length / asapAll.length * 100) : 0;

  const todayStr = now.toISOString().slice(0, 10);
  const todayT = tasks.filter(t => (t.dueDate === todayStr || t.asap) && t.status !== 'done');
  const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() + (6 - now.getDay()));
  const weekT = tasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false;
    return t.dueDate >= todayStr && t.dueDate <= weekEnd.toISOString().slice(0, 10);
  }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <div className="page on">
      <div className="dg">
        <div className="dg-date">{dateStr}</div>
        <div className="dg-hello">안녕하세요, Sunhee님! 👋</div>
      </div>

      <div className="dc">
        <DonutCard label="진행중 완료율" percent={p1} color="#4A7C6F"
          desc={`진행중 ${inprog.length}건 평균`} onClick={() => onGoTaskFilter('inprogress')} />
        <DonutCard label="홀드 비율" percent={p2} color="#EF9F27"
          desc={`전체 중 홀드 ${hold.length}건`} onClick={() => onGoTaskFilter('hold')} />
        <DonutCard label="ASAP 처리율" percent={p3} color="#E24B4A"
          desc={`ASAP ${asapAll.length}건 중 ${asapDone.length}건 완료`} onClick={() => onGoTaskFilter('asap')} />
      </div>

      <div className="ds">
        <div className="ds-card">
          <div className="ds-title">🔴 오늘 마감 &amp; ASAP</div>
          {!todayT.length
            ? <div className="ds-empty">오늘 마감 태스크가 없어요 🎉</div>
            : todayT.map(t => <TaskRow key={t.id} task={t} />)
          }
        </div>
        <div className="ds-card">
          <div className="ds-title">📅 이번 주 마감</div>
          {!weekT.length
            ? <div className="ds-empty">이번 주 마감 태스크가 없어요</div>
            : weekT.map(t => <TaskRow key={t.id} task={t} />)
          }
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task }) {
  const cat = CAT[task.cat] || { i: '' };
  const dd  = getDdayInfo(task);
  return (
    <div className="ds-item">
      <span style={{ fontSize: 14 }}>{cat.i}</span>
      <span className="ds-name">{task.name}</span>
      {task.asap
        ? <span className="asap-t" style={{ fontSize: 11 }}>ASAP</span>
        : <span className="ds-due">{fmtDate(task.dueDate)}{dd && <span className={'dday ' + dd.cls} style={{ marginLeft: 4 }}>{dd.label}</span>}</span>
      }
    </div>
  );
}
