import { SB_URL, SB_KEY } from './constants';

const STORE_KEY = 'sb_session';

function save(data) {
  const prev = getSession();
  const session = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at || Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
    email: (data.user && data.user.email) || (prev && prev.email) || null,
  };
  localStorage.setItem(STORE_KEY, JSON.stringify(session));
  return session;
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY));
  } catch {
    return null;
  }
}

export function signOut() {
  localStorage.removeItem(STORE_KEY);
}

async function authRequest(grantType, body) {
  const res = await fetch(SB_URL + '/auth/v1/token?grant_type=' + grantType, {
    method: 'POST',
    headers: { apikey: SB_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('auth_failed');
  return save(await res.json());
}

export function signIn(email, password) {
  return authRequest('password', { email, password });
}

// 로그인된 사용자 자신의 비밀번호를 바꿔요. 현재 비밀번호 확인 없이
// 바로 바뀌므로, 호출 전에 현재 비밀번호로 재로그인해 본인 확인을 해요.
export async function updatePassword(newPassword) {
  const s = getSession();
  if (!s) throw new Error('로그인이 필요합니다.');
  const res = await fetch(SB_URL + '/auth/v1/user', {
    method: 'PUT',
    headers: {
      apikey: SB_KEY,
      Authorization: 'Bearer ' + s.access_token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password: newPassword }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).msg || '변경 실패');
  return res.json();
}

export function getEmail() {
  const s = getSession();
  return s ? s.email || null : null;
}

let refreshing = null;

// 만료 1분 전이면 자동으로 토큰을 새로 받아요.
export async function getAccessToken() {
  const s = getSession();
  if (!s) return null;
  if (s.expires_at - 60 > Date.now() / 1000) return s.access_token;
  if (!refreshing) {
    refreshing = authRequest('refresh_token', { refresh_token: s.refresh_token })
      .catch(() => {
        signOut();
        return null;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  const fresh = await refreshing;
  return fresh ? fresh.access_token : null;
}
