import React, { useEffect, useState } from 'react';

// 폰 키보드는 password 칸(그리고 -webkit-text-security로 가린 칸)에서 마지막에 친 글자를 잠깐 보여준다.
// 그래서 일반 text 칸에 '모든 글자를 점으로 그리는 글꼴'을 입혀서 가린다.
// 글꼴이 준비됐는지 확인되기 전에는 password 칸을 써서, 글자가 그대로 보이는 순간이 없게 한다.
const FONT = "16px 'text-security-disc'";

export default function SecretInput({ show, className = '', ...rest }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    if (document.fonts && document.fonts.load) {
      document.fonts.load(FONT, 'a1').then(list => { if (alive && list.length) setReady(true); }).catch(() => {});
    }
    return () => { alive = false; };
  }, []);

  if (!ready) return <input {...rest} type={show ? 'text' : 'password'} className={className} />;
  return (
    <input {...rest} type="text" autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false}
      className={className + (show ? '' : ' masked')} />
  );
}
