import React from 'react';

// 선 아이콘 형태의 눈 표시. show=true면 눈 모양(보임), false면 사선이 그어진 눈(가려짐).
export default function EyeIcon({ show }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
      {!show && <line x1="3" y1="21" x2="21" y2="3" />}
    </svg>
  );
}
