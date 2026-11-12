import React, { useState } from 'react';
import { Mark } from './Icon';
import { signIn } from '../utils/auth';
import EyeIcon from './EyeIcon';
import SecretInput from './SecretInput';

export default function LockScreen({ onUnlock }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const [showPw, setShowPw] = useState(false);
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
        <div className="lock-logo"><Mark size={48} /></div>
        <div className="lock-title">업무 관리</div>
        <div className="lock-sub">로그인해주세요</div>

        <div className="lock-field">
          <SecretInput
            className="lock-inp lock-inp-email"
            show={showEmail}
            name="email"
            autoComplete="username"
            placeholder="이메일"
            value={email}
            onChange={e => { setEmail(e.target.value); setErr(''); }}
          />
          <button type="button" className="lock-eye" tabIndex={-1}
            onClick={() => setShowEmail(v => !v)}><EyeIcon show={showEmail} /></button>
        </div>

        <div className="lock-field">
          <SecretInput
            className="lock-inp"
            show={showPw}
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={pw}
            onChange={e => { setPw(e.target.value); setErr(''); }}
          />
          <button type="button" className="lock-eye" tabIndex={-1}
            onClick={() => setShowPw(v => !v)}><EyeIcon show={showPw} /></button>
        </div>

        <div className="lock-err">{err}</div>
        <button className="lock-btn" type="submit" disabled={busy}>
          {busy ? '확인 중…' : '로그인'}
        </button>
      </form>
    </div>
  );
}
