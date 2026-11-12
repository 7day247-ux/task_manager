import React, { useState } from 'react';
import { signIn, updatePassword, getEmail } from '../utils/auth';

export default function ChangePasswordModal({ onClose, showToast }) {
  const email = getEmail();
  const [curPw, setCurPw]   = useState('');
  const [newPw, setNewPw]   = useState('');
  const [newPw2, setNewPw2] = useState('');
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [err, setErr]   = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (newPw.length < 4) { setErr('새 비밀번호는 4자 이상으로 입력해주세요.'); return; }
    if (newPw !== newPw2) { setErr('새 비밀번호가 서로 다릅니다.'); return; }
    if (!email) { setErr('로그인 정보를 확인할 수 없어요. 다시 로그인해주세요.'); return; }
    setBusy(true);
    try {
      // 현재 비밀번호가 맞는지 먼저 확인
      await signIn(email, curPw);
      await updatePassword(newPw);
      setDone(true);
    } catch {
      setErr('현재 비밀번호가 올바르지 않거나 변경에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pwm-ovl" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pwm-box">
        <div className="pwm-ttl">비밀번호 변경</div>
        {done ? (
          <>
            <div className="pwm-ok">✅ 비밀번호가 변경되었어요. 다음 로그인부터 새 비밀번호를 사용해주세요.</div>
            <button className="btn btn-p" onClick={onClose}>확인</button>
          </>
        ) : (
          <form onSubmit={submit}>
            <div className="pwm-grp">
              <label className="pwm-lbl">현재 비밀번호</label>
              <div className="lock-field">
                <input className="lock-inp" type={showCur ? 'text' : 'password'}
                  value={curPw} onChange={e => setCurPw(e.target.value)} autoFocus />
                <button type="button" className="lock-eye" tabIndex={-1}
                  onClick={() => setShowCur(v => !v)}>{showCur ? '🙈' : '👁️'}</button>
              </div>
            </div>
            <div className="pwm-grp">
              <label className="pwm-lbl">새 비밀번호</label>
              <div className="lock-field">
                <input className="lock-inp" type={showNew ? 'text' : 'password'}
                  value={newPw} onChange={e => setNewPw(e.target.value)} />
                <button type="button" className="lock-eye" tabIndex={-1}
                  onClick={() => setShowNew(v => !v)}>{showNew ? '🙈' : '👁️'}</button>
              </div>
            </div>
            <div className="pwm-grp">
              <label className="pwm-lbl">새 비밀번호 확인</label>
              <input className="lock-inp" style={{ marginBottom: 0 }} type={showNew ? 'text' : 'password'}
                value={newPw2} onChange={e => setNewPw2(e.target.value)} />
            </div>
            <div className="lock-err">{err}</div>
            <div className="pwm-btns">
              <button type="button" className="btn" onClick={onClose} disabled={busy}>취소</button>
              <button type="submit" className="btn btn-p" disabled={busy}>{busy ? '변경 중…' : '변경하기'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
