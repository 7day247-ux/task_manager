import React, { useState } from 'react';

const NAV_ITEMS = [
  { id: 'dashboard',  icon: '🏠', label: '대시보드' },
  { id: 'tasks',      icon: '✅', label: '태스크' },
  { id: 'calendar',   icon: '📅', label: '캘린더' },
  { id: 'meetings',   icon: '📝', label: '회의록' },
  { id: 'completed',  icon: '🏆', label: '완료' },
  { id: 'reflection', icon: '🌱', label: 'Reflection' },
];

export default function Sidebar({ curPage, onNav, onPrint }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* 데스크톱/태블릿 사이드바 */}
      <nav
        className={'sb show' + (expanded ? ' sb-expanded' : '')}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <div className="sb-top">
          <div className="sb-brand">
            <div className="sb-logo">🎨</div>
            <span className="sb-bname">Atelier</span>
          </div>
          <div className="sb-prof">
            <div className="sb-av">S</div>
            <div className="sb-prof-info">
              <div className="sb-uname">Sunhee</div>
              <div className="sb-role">디자이너</div>
            </div>
          </div>
        </div>

        <div className="sb-sec">MENU</div>
        <ul className="sb-ul">
          {NAV_ITEMS.map(item => (
            <li key={item.id}>
              <a
                href="#"
                className={curPage === item.id ? 'on' : ''}
                onClick={e => { e.preventDefault(); onNav(item.id); }}
                title={item.label}
              >
                <span className="sb-ico">{item.icon}</span>
                <span className="sb-label">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="sb-bot">
          <button className="sb-pdf" onClick={onPrint} title="PDF 내보내기">
            <span className="sb-ico">🖨️</span>
            <span className="sb-label">PDF 내보내기</span>
          </button>
        </div>
      </nav>

      {/* 모바일 하단 탭바 */}
      <nav className="mobile-tabbar">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={'mobile-tab' + (curPage === item.id ? ' on' : '')}
            onClick={() => onNav(item.id)}
          >
            <span className="mobile-tab-icon">{item.icon}</span>
            <span className="mobile-tab-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
