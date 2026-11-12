import React from 'react';

// 폰 키보드는 password 칸에서 마지막에 친 글자를 잠깐 보여준다.
// 브라우저가 지원하면 text 칸에 -webkit-text-security로 가려서 그 노출을 막고,
// 지원하지 않는 브라우저에서는 평소처럼 password 칸을 쓴다(글자가 그대로 보이는 일이 없도록).
const CAN_MASK = typeof CSS !== 'undefined' && !!CSS.supports && CSS.supports('-webkit-text-security', 'disc');

export default function SecretInput({ show, className = '', ...rest }) {
  if (CAN_MASK) {
    return (
      <input {...rest} type="text" autoCapitalize="off" autoCorrect="off" spellCheck={false}
        className={className + (show ? '' : ' masked')} />
    );
  }
  return <input {...rest} type={show ? 'text' : 'password'} className={className} />;
}
