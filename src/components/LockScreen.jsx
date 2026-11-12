import React, { useState } from 'react';
import { signIn } from '../utils/auth';

export default function LockScreen({ onUnlock }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!email || !pw || busy) return;
    setBusy(true);
    try {
      await signIn(email.trim(), pw);
      onUnlock();
    } catch {
      setErr('이메일 또는 비밀번호가 틀렸습니다.');
      setPw('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="lock">
      <form className="lock-box" onSubmit={submit}>
        <div className="lock-logo">📋</div>
        <div className="lock-title">업무 관리</div>
        <div className="lock-sub">로그인해주세요</div>
        <input
          className="lock-inp lock-inp-email"
          type="email"
          name="email"
          autoComplete="username"
          placeholder="이메일"
          value={email}
          onChange={e => { setEmail(e.target.value); setErr(''); }}
        />
        <input
          className="lock-inp"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={pw}
          onChange={e => { setPw(e.target.value); setErr(''); }}
        />
        <div className="lock-err">{err}</div>
        <button className="lock-btn" type="submit" disabled={busy}>
          {busy ? '확인 중…' : '로그인'}
        </button>
      </form>
    </div>
  );
}
