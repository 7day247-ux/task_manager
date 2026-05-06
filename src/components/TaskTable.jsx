import React from 'react';
import { STATUS, CAT, PKG_LABELS } from '../utils/constants';
import { fmtDate, pct, curStep, getDdayInfo } from '../utils/helpers';

export default function TaskTable({ rows, onRowClick }) {
  if (!rows.length) {
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr><td colSpan={8} className="empty-r">태스크가 없습니다.</td></tr>
        </tbody>
      </table>
    );
  }

  return (
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
  );
}
