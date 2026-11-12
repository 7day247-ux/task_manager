import React, { useState } from 'react';
import Icon from './Icon';
import { REFLECTION_PASSWORD } from '../utils/constants';
import SecretInput from './SecretInput';

export default function ReflectionLock({ onUnlock }) {
  const [pw, setPw]   = useState('');
  const [err, setErr] = useState('');
  const [shake, setShake] = useState(false);

  function check() {
    if (pw === REFLECTION_PASSWORD) {
      onUnlock();
    } else {
      setErr('비밀번호가 틀렸습니다.');
      setPw('');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div className="rf-lock">
      <div className={'rf-lock-box' + (shake ? ' shake' : '')}>
        <div className="rf-lock-icon"><Icon name="lock" size={34} stroke={1.5} /></div>
        <div className="rf-lock-title">Reflection</div>
        <div className="rf-lock-sub">나만의 성장 일지예요</div>
        <SecretInput
          className="lock-inp"
          show={false}
          inputMode="numeric"
          placeholder="••••"
          maxLength={4}
          value={pw}
          onChange={e => { setPw(e.target.value); setErr(''); }}
          onKeyDown={e => e.key === 'Enter' && check()}
          autoFocus
        />
        <div className="lock-err">{err}</div>
        <button className="lock-btn" onClick={check}>
          입력
        </button>
      </div>
    </div>
  );
}
