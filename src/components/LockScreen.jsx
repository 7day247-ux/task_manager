import React, { useState } from 'react';
import { PASSWORD } from '../utils/constants';

export default function LockScreen({ onUnlock }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  function checkPw() {
    if (pw === PASSWORD) {
      sessionStorage.setItem('auth', '1');
      onUnlock();
    } else {
      setErr('비밀번호가 틀렸습니다.');
      setPw('');
    }
  }

  return (
    <div className="lock">
      <div className="lock-box">
        <div className="lock-logo">📋</div>
        <div className="lock-title">업무 관리</div>
        <div className="lock-sub">비밀번호를 입력해주세요</div>
        <input
          className="lock-inp"
          type="password"
          placeholder="••••••••"
          maxLength={20}
          value={pw}
          onChange={e => { setPw(e.target.value); setErr(''); }}
          onKeyDown={e => e.key === 'Enter' && checkPw()}
        />
        <div className="lock-err">{err}</div>
        <button className="lock-btn" onClick={checkPw}>입력</button>
      </div>
    </div>
  );
}
