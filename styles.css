import React from 'react';
import { STATUS, CAT, PKG_LABELS } from '../utils/constants';
import { fmtDate, pct, curStep, getDdayInfo } from '../utils/helpers';

function TaskCard({ t, onRowClick }) {
  const st  = STATUS[t.status];
  const cat = CAT[t.cat] || { l: '', b: '', i: '' };
  const p   = pct(t);
  const cs  = curStep(t);
  const dd  = getDdayInfo(t);
  const tb  = t.ttype === 'edit'
    ? <span className="bdg b-edt">수정</span>
    : t.ttype === 'variation'
      ? <span className="bdg b-var">베리</span>
      : <span className="bdg b-new">신규</span>;
  const pkgLabel = t.cat === 'pkg' && t.pkgType
    ? <span className="bdg b-pkgt">{PKG_LABELS[t.pkgType] || t.pkgType}</span>
    : null;

  return (
    <div className="task-card" onClick={() => onRowClick(t.id)}>
      <div className="task-card-top">
        <span className="task-card-name">{t.name}</span>
        <div className="task-card-badges">
          <span className={'bdg ' + cat.b}>{cat.l}</span>
          {tb}{pkgLabel}
        </div>
      </div>
      <div className="task-card-step">
        <span className="slbl">{cs.length > 20 ? cs.slice(0, 20) + '…' : cs}</span>
        <div className="pbar" style={{ marginTop: 4 }}>
          <div className="pfill" style={{ width: p + '%', background: st.c }} />
        </div>
      </div>
      <div className="task-card-meta">
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="dot" style={{ background: st.c }} />
          <span style={{ fontSize: 12 }}>{st.l}</span>
        </div>
        <div style={{ fontSize: 12, color: '#9A9590' }}>
          요청 {fmtDate(t.reqDate)}
        </div>
        <div style={{ fontSize: 12 }}>
          {t.asap
            ? <span className="asap-t">ASAP</span>
            : t.dueDate
              ? <><span style={{ color: '#9A9590' }}>기한 {fmtDate(t.dueDate)}</span>{dd && <span className={'dday ' + dd.cls}>{dd.label}</span>}</>
              : <span style={{ color: '#9A9590' }}>기한 —</span>
          }
        </div>
      </div>
      {t.note && (
        <div className="task-card-note">
          {t.note.slice(0, 50)}{t.note.length > 50 ? '…' : ''}
        </div>
      )}
    </div>
  );
}

export default function TaskTable({ rows, onRowClick }) {
  if (!rows.length) {
    return (
      <div className="empty-r" style={{ padding: '2rem', textAlign: 'center', color: '#9A9590', fontSize: 13 }}>
        태스크가 없습니다.
      </div>
    );
  }

  return (
    <>
      {/* 데스크톱/태블릿 테이블 */}
      <div className="task-table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: '25%' }}>프로젝트명</th>
              <th style={{ width: '8%' }}>유형</th>
              <th style={{ width: '7%' }}>타입</th>
              <th style={{ width: '18%' }}>현재 단계</th>
              <th style={{ width: '10%' }}>요청일</th>
              <th style={{ width: '10%' }}>기한</th>
              <th style={{ width: '8%' }}>상태</th>
              <th style={{ width: '14%' }}>비고</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(t => {
              const st  = STATUS[t.status];
              const cat = CAT[t.cat] || { l: '', b: '' };
              const p   = pct(t);
              const cs  = curStep(t);
              const dd  = getDdayInfo(t);
              const nt  = t.note ? t.note.slice(0, 28) + (t.note.length > 28 ? '…' : '') : '';
              const tb  = t.ttype === 'edit'
                ? <span className="bdg b-edt">수정</span>
                : t.ttype === 'variation'
                  ? <span className="bdg b-var">베리</span>
                  : <span className="bdg b-new">신규</span>;
              const pkgLabel = t.cat === 'pkg' && t.pkgType
                ? <span className="bdg b-pkgt" style={{ fontSize: 10 }}>{PKG_LABELS[t.pkgType] || t.pkgType}</span>
                : null;
              const dueCell = t.asap
                ? <span className="asap-t">ASAP</span>
                : t.dueDate
                  ? <><span style={{ fontSize: 12, color: '#9A9590' }}>{fmtDate(t.dueDate)}</span>{dd && <span className={'dday ' + dd.cls}>{dd.label}</span>}</>
                  : <span style={{ color: '#9A9590' }}>—</span>;
              return (
                <tr key={t.id} className="row" onClick={() => onRowClick(t.id)}>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>{t.name}</td>
                  <td><span className={'bdg ' + cat.b}>{cat.l}</span></td>
                  <td>{tb}{pkgLabel}</td>
                  <td>
                    <div className="slbl">{cs.length > 14 ? cs.slice(0, 14) + '…' : cs}</div>
                    <div className="pbar"><div className="pfill" style={{ width: p + '%', background: st.c }} /></div>
                  </td>
                  <td style={{ fontSize: 12, color: '#9A9590' }}>{fmtDate(t.reqDate)}</td>
                  <td>{dueCell}</td>
                  <td><div style={{ display: 'flex', alignItems: 'center' }}><span className="dot" style={{ background: st.c }} /><span style={{ fontSize: 12 }}>{st.l}</span></div></td>
                  <td style={{ fontSize: 11, color: '#9A9590' }}>{nt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 모바일 카드 목록 */}
      <div className="task-cards-wrap">
        {rows.map(t => <TaskCard key={t.id} t={t} onRowClick={onRowClick} />)}
      </div>
    </>
  );
}
