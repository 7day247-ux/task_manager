import React, { useState } from 'react';
import Icon from './Icon';

// 부자재 리드타임: 최종 디자인 데이터 이관 → 공장 입고까지 (주 단위, 손메모 기준)
// max가 없으면 단일 기간, weeks가 null이면 기간 미정
export const LEAD_TIMES = [
  { cat: '젤리', items: [{ name: '파우치', min: 3 }, { name: 'D/C', min: 2 }, { name: '외박스', min: null }] },
  { cat: '와플', items: [{ name: '필름', min: 2, max: 3 }, { name: '지케이스', min: null }] },
  { cat: '캔디', items: [{ name: '인쇄포장', min: 2, max: 3 }, { name: '대봉투(필름)', min: 3 }] },
  { cat: '바',   items: [{ name: '필름', min: 2 }] },
  { cat: '콘',   items: [{ name: '리드지', min: 5 }, { name: '바디', min: 4 }] },
  { cat: '샌드', items: [{ name: '필름', min: 2, max: 3 }] },
  { cat: '튜브', items: [{ name: '필름', min: 2, max: 3 }] },
];

const pad = n => String(n).padStart(2, '0');
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
function addWeeks(d, w) {
  const [y, m, dd] = d.split('-').map(Number);
  const t = new Date(y, m - 1, dd + w * 7);
  return (t.getMonth() + 1) + '/' + t.getDate() + '(' + DOW[t.getDay()] + ')';
}
function today() {
  const d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

export default function LeadTimeModal({ onClose }) {
  const [date, setDate] = useState(today());
  const [open, setOpen] = useState(null);

  return (
    <div className="ovl" style={{ display: 'flex' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div className="mhd">
          <div>
            <div className="mhd-t">부자재 리드타임</div>
            <div className="mhd-s">최종 데이터 이관 → 공장 입고까지</div>
          </div>
          <button className="xbtn" onClick={onClose} aria-label="닫기"><Icon name="x" size={20} /></button>
        </div>
        <div className="mbd">
          <label className="lt-calc">
            <span>데이터 이관일</span>
            <input className="fi" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </label>
          <div className="lt-hint">이관일을 넣으면 입고 예상일이 계산돼요 (주말 포함 달력 기준, 범위는 늦은 쪽).</div>
          {LEAD_TIMES.map(g => (
            <div key={g.cat} className="lt-g">
              <div className="lt-cat">{g.cat}</div>
              {g.items.map(it => (
                <div key={it.name} className="lt-row">
                  <span className="lt-name">{it.name}</span>
                  <span className="lt-wk">{it.min == null ? '—' : it.max ? it.min + '~' + it.max + '주' : it.min + '주'}</span>
                  <span className="lt-due">{it.min == null || !date ? '' : addWeeks(date, it.max || it.min)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
