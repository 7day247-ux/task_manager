import React from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', icon: '🏠', label: '대시보드' },
  { id: 'tasks',     icon: '✅', label: '태스크' },
  { id: 'calendar',  icon: '📅', label: '캘린더' },
  { id: 'meetings',  icon: '📝', label: '회의록 & 메모' },
  { id: 'completed', icon: '🏆', label: '완료 현황' },
];

export default function Sidebar({ curPage, onNav, onPrint }) {
  return (
    <nav className="sb show">
      <div className="sb-top">
        <div className="sb-brand">
          <div className="sb-logo">📋</div>
          <span className="sb-bname">업무 관리</span>
        </div>
        <div className="sb-prof">
          <div className="sb-av">S</div>
          <div>
            <div className="sb-uname">Sunhee</div>
            <div className="sb-role">디자이너</div>
          </div>
        </div>
      </div>

      <div className="sb-sec">메뉴</div>
      <ul className="sb-ul">
        {NAV_ITEMS.map(item => (
          <li key={item.id}>
            <a
              href="#"
              className={curPage === item.id ? 'on' : ''}
              onClick={e => { e.preventDefault(); onNav(item.id); }}
            >
              <span className="sb-ico">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="sb-bot">
        <button className="sb-pdf" onClick={onPrint}>
          🖨️ <span>PDF 내보내기</span>
        </button>
      </div>
    </nav>
  );
}
