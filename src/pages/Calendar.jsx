import React, { useState, useCallback } from 'react';
import { KR_HOLIDAYS } from '../utils/constants';
import { STATUS, CAT } from '../utils/constants';
import { pad, fmtDate, pct, getDdayInfo, api } from '../utils/helpers';
import LeaveModal from '../components/LeaveModal';

const FILTER_CHIPS = [
  { id: 'all',        label: '전체',   cls: '' },
  { id: 'inprogress', label: '진행중', cls: 'blue' },
  { id: 'hold',       label: '홀드',   cls: 'amber' },
  { id: 'done',       label: '완료',   cls: 'green' },
];

export default function Calendar({ tasks, leaves, onReloadLeaves, showToast }) {
  const now = new Date();
  const [calY, setCalY]   = useState(now.getFullYear());
  const [calM, setCalM]   = useState(now.getMonth());
  const [calSel, setCalSel] = useState(null);
  const [calF, setCalF]   = useState('all');
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveInitDate, setLeaveInitDate] = useState('');

  const todayStr = now.toISOString().slice(0, 10);

  function chMo(d) {
    let m = calM + d, y = calY;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setCalM(m); setCalY(y);
  }

  function goToday() {
    setCalY(now.getFullYear()); setCalM(now.getMonth());
    setCalSel(todayStr);
  }

  const filtered = tasks.filter(t => calF === 'all' || t.status === calF);

  const byDate = {};
  filtered.forEach(t => {
    if (!t.dueDate) return;
    if (!byDate[t.dueDate]) byDate[t.dueDate] = [];
    byDate[t.dueDate].push(t);
  });

  const leaveMap = {};
  leaves.forEach(l => { leaveMap[l.leave_date] = (leaveMap[l.leave_date] || 0) + Number(l.amount); });
  const totalLeave = Object.values(leaveMap).reduce((s, v) => s + v, 0);

  const fd = new Date(calY, calM, 1).getDay();
  const dm = new Date(calY, calM + 1, 0).getDate();
  const dp = new Date(calY, calM, 0).getDate();
  const tc = Math.ceil((fd + dm) / 7) * 7;

  const cells = [];
  for (let i = 0; i < tc; i++) {
    let dn, ds, oth = false;
    if (i < fd) {
      dn = dp - fd + i + 1;
      const pm = calM === 0 ? 11 : calM - 1, py = calM === 0 ? calY - 1 : calY;
      ds = py + '-' + pad(pm + 1) + '-' + pad(dn); oth = true;
    } else if (i >= fd + dm) {
      dn = i - fd - dm + 1;
      const nm = calM === 11 ? 0 : calM + 1, ny = calM === 11 ? calY + 1 : calY;
      ds = ny + '-' + pad(nm + 1) + '-' + pad(dn); oth = true;
    } else {
      dn = i - fd + 1; ds = calY + '-' + pad(calM + 1) + '-' + pad(dn);
    }
    cells.push({ i, dn, ds, oth, dow: i % 7 });
  }

  const mos = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

  async function handleDeleteLeaveDate(ds) {
    if (!confirm(ds + ' 연차를 삭제할까요?')) return;
    const ids = leaves.filter(l => l.leave_date === ds).map(l => l.id);
    showToast('삭제 중...');
    try {
      for (const id of ids) await api('leaves?id=eq.' + id, { method: 'DELETE' });
      await onReloadLeaves();
    } catch (e) { showToast('삭제 실패: ' + e.message, true); }
  }

  const selData = calSel ? (() => {
    const d    = new Date(calSel);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const holiday  = KR_HOLIDAYS[calSel] || null;
    const leaveAmt = leaves.filter(l => l.leave_date === calSel).reduce((s, l) => s + Number(l.amount), 0);
    const shown = filtered.filter(t => t.dueDate === calSel);
    return { d, days, holiday, leaveAmt, shown };
  })() : null;

  return (
    <div className="page on">
      {/* Toolbar */}
      <div className="cal-tb">
        <div className="cal-nav">
          <button className="cal-nb" onClick={() => chMo(-1)}>‹</button>
          <div className="cal-mo">{calY}년 {mos[calM]}</div>
          <button className="cal-nb" onClick={() => chMo(1)}>›</button>
          <button className="btn btn-sm btn-g" onClick={goToday}>오늘</button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="cal-fs">
            {FILTER_CHIPS.map(chip => (
              <button key={chip.id} className={'cal-chip' + (chip.cls ? ' ' + chip.cls : '') + (calF === chip.id ? ' on' : '')}
                onClick={() => setCalF(chip.id)}>{chip.label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#9A9590' }}>연차 사용: <span>{totalLeave}</span>일</span>
            <button className="btn btn-sm" style={{ fontSize: 11 }}
              onClick={() => { setLeaveInitDate(todayStr); setLeaveOpen(true); }}>🏖️ 연차 관리</button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="cal-grid">
        <div className="cal-wds">
          {['일','월','화','수','목','금','토'].map((w, i) => (
            <div key={i} className="cal-wd" style={i === 0 ? { color: '#E24B4A' } : i === 6 ? { color: '#378ADD' } : {}}>{w}</div>
          ))}
        </div>
        <div className="cal-days">
          {cells.map(({ i, dn, ds, oth, dow }) => {
            const isWeekend = dow === 0 || dow === 6;
            const holiday   = KR_HOLIDAYS[ds] || null;
            const leaveAmt  = leaveMap[ds] || 0;
            const isToday   = ds === todayStr;
            const isSel     = ds === calSel;
            const ents      = byDate[ds] || [];

            let cls = 'cal-day';
            if (oth)              cls += ' oth';
            if (isToday)          cls += ' tod';
            if (isSel)            cls += ' sel';
            if (holiday && !oth)  cls += ' holiday';
            if (leaveAmt > 0 && !oth) cls += ' has-leave';

            return (
              <div key={i} className={cls} onClick={() => { setCalSel(ds); }}>
                <div className="dn">{dn}</div>
                {holiday && !oth && <div className="cal-holiday-lbl">{holiday}</div>}
                {leaveAmt > 0 && !oth && <div className="cal-leave-lbl">연차 {leaveAmt}일</div>}
                {(!isWeekend || oth) && ents.slice(0, 2).map((t, ei) => (
                  <div key={ei} className={'cal-ev ' + (t.status === 'done' ? 'done' : t.status)}
                    style={t.status === 'done' ? { opacity: .45 } : {}}>
                    {t.name.slice(0, 9)}
                  </div>
                ))}
                {(!isWeekend || oth) && ents.length > 2 && <div className="cal-more">+{ents.length - 2}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail */}
      <div className="cal-det">
        {!calSel ? (
          <>
            <div className="cal-det-ttl">날짜를 클릭하면 태스크를 볼 수 있어요</div>
            <div className="cal-det-empty">날짜를 선택해주세요</div>
          </>
        ) : (
          <>
            <div className="cal-det-ttl">
              {(selData.d.getMonth() + 1)}월 {selData.d.getDate()}일 ({selData.days[selData.d.getDay()]})
              {selData.holiday && ' · 🎌' + selData.holiday}
              {selData.leaveAmt > 0 && ' · 🏖️연차 ' + selData.leaveAmt + '일'}
            </div>
            {selData.leaveAmt > 0 ? (
              <div style={{ background: '#EEF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '10px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#1A6BB5' }}>🏖️ 연차 {selData.leaveAmt}일</span>
                <button onClick={() => handleDeleteLeaveDate(calSel)} style={{ fontSize: 11, color: '#E24B4A', background: 'none', border: 'none', cursor: 'pointer' }}>삭제</button>
              </div>
            ) : (
              <div style={{ marginBottom: 10 }}>
                <button className="btn btn-sm" style={{ fontSize: 11, color: '#185FA5', borderColor: '#BFDBFE' }}
                  onClick={() => { setLeaveInitDate(calSel); setLeaveOpen(true); }}>+ 이날 연차 추가</button>
              </div>
            )}
            {!selData.shown.length && !selData.leaveAmt && (
              <div className="cal-det-empty">이 날짜에 해당하는 태스크가 없어요</div>
            )}
            {selData.shown.map(t => {
              const st  = STATUS[t.status];
              const cat = CAT[t.cat] || { b: '', l: '' };
              const p   = pct(t);
              const dd  = getDdayInfo(t);
              const isDone = t.status === 'done';
              return (
                <div key={t.id} className="cal-tc" style={isDone ? { opacity: .55 } : {}}>
                  <div className="cal-tc-top">
                    <div className="cal-tc-name">{t.name}{isDone ? ' ✓' : ''}</div>
                    <span className={'bdg ' + cat.b}>{cat.l}</span>
                  </div>
                  <div className="cal-tc-meta">
                    <span className="dot" style={{ background: st.c }} /><span>{st.l}</span>
                    {t.reqDate && <span>요청 {fmtDate(t.reqDate)}</span>}
                    <span>마감 {fmtDate(t.dueDate)}</span>
                    {dd && <span className={'dday ' + dd.cls}>{dd.label}</span>}
                  </div>
                  <div className="pbar"><div className="pfill" style={{ width: p + '%', background: st.c }} /></div>
                  {t.note && <div style={{ fontSize: 11, color: '#9A9590', marginTop: 6 }}>{t.note.slice(0, 60)}{t.note.length > 60 ? '…' : ''}</div>}
                </div>
              );
            })}
          </>
        )}
      </div>

      {leaveOpen && (
        <LeaveModal
          leaves={leaves}
          onClose={() => setLeaveOpen(false)}
          onSaved={onReloadLeaves}
          showToast={showToast}
        />
      )}
    </div>
  );
}
