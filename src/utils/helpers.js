import { SB_URL, SB_KEY, PKG_STEPS, VID_STEPS, STATUS, CAT, KR_HOLIDAYS } from './constants';
import { getAccessToken, signOut } from './auth';

export async function api(path, opts = {}) {
  const token = await getAccessToken();
  if (!token) {
    signOut();
    window.location.reload();
    throw new Error('로그인이 필요합니다.');
  }
  const headers = {
    apikey: SB_KEY,
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };
  const fo = { method: opts.method || 'GET', headers };
  if (opts.body) fo.body = opts.body;
  const res = await fetch(SB_URL + '/rest/v1/' + path, fo);
  if (res.status === 401) {
    signOut();
    window.location.reload();
    throw new Error('로그인이 만료되었습니다.');
  }
  if (!res.ok) throw new Error(await res.text());
  const t = await res.text();
  return t ? JSON.parse(t) : null;
}

export function getSteps(cat) {
  if (cat === 'pkg') return [...PKG_STEPS];
  if (cat === 'video') return [...VID_STEPS];
  return [];
}

export function isCustomCat(cat) {
  return cat === 'inhouse' || cat === 'posm' || cat === 'project' || cat === 'general';
}

export function pct(task) {
  if (task.ttype === 'edit') return task.ecnt > 0 ? 100 : 0;
  if (isCustomCat(task.cat)) {
    const items = task.steps.filter(x => x && typeof x === 'object');
    if (!items.length) return 0;
    return Math.round((items.filter(x => x.done).length / items.length) * 100);
  }
  const steps = getSteps(task.cat);
  if (!steps.length) return 0;
  return Math.round(
    task.steps.filter(v => v && (v === 1 || (typeof v === 'object' && v.done))).length /
      steps.length *
      100
  );
}

export function curStep(task) {
  if (task.ttype === 'edit') return '수정 ' + task.ecnt + '회';
  if (isCustomCat(task.cat)) {
    const items = task.steps.filter(x => x && typeof x === 'object');
    const undone = items.filter(x => !x.done);
    return undone.length ? undone[0].name : items.length ? '완료' : '할 일 없음';
  }
  const steps = getSteps(task.cat);
  const idx = task.steps.findIndex(v => !v || (typeof v === 'object' && !v.done));
  return idx === -1 ? steps[steps.length - 1] : steps[idx];
}

export function fmtDate(d) {
  return d ? d.slice(5).replace('-', '.') : '—';
}

export function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

export function getDdayInfo(task) {
  if (task.asap || !task.dueDate || task.status === 'done') return null;
  const diff = Math.ceil(
    (new Date(task.dueDate) - new Date(new Date().toDateString())) / 86400000
  );
  if (diff < 0) return { cls: 'dd-u', label: 'D+' + Math.abs(diff) };
  if (diff === 0) return { cls: 'dd-u', label: 'D-day' };
  if (diff <= 3) return { cls: 'dd-w', label: 'D-' + diff };
  if (diff <= 7) return { cls: 'dd-o', label: 'D-' + diff };
  return null;
}

export function toRow(d) {
  return {
    name: d.name,
    type: d.cat,
    req_date: d.reqDate || null,
    due_date: d.dueDate || null,
    asap: d.asap,
    status: d.status,
    steps: d.steps,
    note: d.note || '',
    task_type: d.ttype || 'new',
    edit_count: d.ecnt || 0,
    pkg_type: d.pkgType || '',
    done_date: d.status === 'done' ? (d.doneDate || null) : null,
    req_time: d.reqTime || '',
    done_time: d.status === 'done' ? (d.doneTime || '') : '',
  };
}

export function mapTask(r) {
  let s = r.steps;
  if (typeof s === 'string') { try { s = JSON.parse(s); } catch { s = []; } }
  if (!Array.isArray(s)) s = [];
  return {
    id: r.id,
    name: r.name,
    cat: r.type || 'general',
    reqDate: r.req_date || '',
    dueDate: r.due_date || '',
    asap: r.asap || false,
    status: r.status || 'waiting',
    steps: s,
    note: r.note || '',
    ttype: r.task_type || 'new',
    ecnt: r.edit_count || 0,
    pkgType: r.pkg_type || '',
    doneDate: r.done_date || '',
    reqTime: r.req_time || '',
    doneTime: r.done_time || '',
  };
}

function parseYmd(v) {
  const [y, m, d] = String(v).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isWorkday(d) {
  const wd = d.getDay();
  return wd !== 0 && wd !== 6 && !KR_HOLIDAYS[ymd(d)];
}

// 리드타임: 요청일 다음 날부터 완료일까지의 근무일 수 (주말·공휴일 제외).
// 같은 날 끝나면 0, 금요일 요청 → 월요일 완료면 1.
export function leadDays(task) {
  if (!task.reqDate || !task.doneDate) return null;
  const a = parseYmd(task.reqDate), b = parseYmd(task.doneDate);
  if (isNaN(a) || isNaN(b) || b < a) return null;
  let n = 0;
  for (const d = new Date(a); d < b;) {
    d.setDate(d.getDate() + 1);
    if (isWorkday(d)) n++;
  }
  return n;
}

// 당일 처리 건의 소요 시간(분). 요청·완료 시간이 둘 다 있을 때만 계산한다.
export function leadMinutes(task) {
  if (leadDays(task) !== 0 || task.reqDate !== task.doneDate) return null;
  if (!/^\d{2}:\d{2}$/.test(task.reqTime || '') || !/^\d{2}:\d{2}$/.test(task.doneTime || '')) return null;
  const mins = t => parseInt(t.slice(0, 2)) * 60 + parseInt(t.slice(3));
  const m = mins(task.doneTime) - mins(task.reqTime);
  return m >= 0 ? m : null;
}

export function fmtMinutes(m) {
  if (m === null || m === undefined) return '—';
  const h = Math.floor(m / 60), r = Math.round(m % 60);
  return h ? h + '시간' + (r ? ' ' + r + '분' : '') : r + '분';
}

export function fmtLead(d) {
  return d === null || d === undefined ? '—' : d === 0 ? '당일' : d + '일';
}

// 화면 표시용: 당일이고 시간이 있으면 '4시간 45분', 아니면 '당일' / 'N일'
export function leadLabel(task) {
  const m = leadMinutes(task);
  return m !== null ? fmtMinutes(m) : fmtLead(leadDays(task));
}

// 기기 시간대 기준 오늘 날짜 (toISOString은 UTC라 한국 오전 9시 전에는 어제로 나온다)
export function ymd(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

export function today() {
  const d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

export function printTasksHtml(tasks, mode) {
  const dt = new Date().toLocaleDateString('ko-KR');
  const thS = 'background:#2C2C2A;color:#fff;padding:6px 10px;text-align:left;font-size:10px;border:1px solid #ccc;';
  const tdS = 'padding:5px 10px;font-size:10px;border:1px solid #e0e0e0;vertical-align:top;';
  let html = `<div style="padding:24px;font-family:sans-serif;">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:16px;border-bottom:2px solid #2C2C2A;padding-bottom:10px;">
      <div style="font-size:16px;font-weight:700;">업무 현황</div>
      <div style="font-size:11px;color:#888;">${dt}</div>
    </div>`;

  if (mode === 'tasks' || mode === 'dashboard') {
    const act = tasks.filter(t => t.status !== 'done');
    html += `<table style="width:100%;border-collapse:collapse;font-size:10px;">
      <thead><tr>
        <th style="${thS}">프로젝트명</th><th style="${thS}">유형</th>
        <th style="${thS}">단계</th><th style="${thS}">요청일</th>
        <th style="${thS}">기한</th><th style="${thS}">상태</th><th style="${thS}">비고</th>
      </tr></thead><tbody>`;
    act.forEach((t, i) => {
      const cat = CAT[t.cat] || { l: '' };
      const st = STATUS[t.status];
      html += `<tr style="${i % 2 ? 'background:#f8f8f6;' : ''}">
        <td style="${tdS}font-weight:600;">${t.name}</td>
        <td style="${tdS}">${cat.l}</td>
        <td style="${tdS}">${curStep(t)}</td>
        <td style="${tdS}">${fmtDate(t.reqDate)}</td>
        <td style="${tdS}">${t.asap ? 'ASAP' : fmtDate(t.dueDate)}</td>
        <td style="${tdS}">${st.l}</td>
        <td style="${tdS}">${t.note || ''}</td>
      </tr>`;
    });
    html += '</tbody></table>';
  } else if (mode === 'completed') {
    const done = tasks.filter(t => t.status === 'done');
    html += `<table style="width:100%;border-collapse:collapse;font-size:10px;">
      <thead><tr>
        <th style="${thS}">프로젝트명</th><th style="${thS}">유형</th>
        <th style="${thS}">타입</th><th style="${thS}">수정횟수</th>
        <th style="${thS}">요청일</th><th style="${thS}">완료일</th>
        <th style="${thS}">리드타임</th><th style="${thS}">비고</th>
      </tr></thead><tbody>`;
    done.forEach((t, i) => {
      const cat = CAT[t.cat] || { l: '' };
      html += `<tr style="${i % 2 ? 'background:#f8f8f6;' : ''}">
        <td style="${tdS}font-weight:600;">${t.name}</td>
        <td style="${tdS}">${cat.l}</td>
        <td style="${tdS}">${t.ttype === 'edit' ? '수정' : '신규'}</td>
        <td style="${tdS}text-align:center;">${t.ecnt || 0}회</td>
        <td style="${tdS}">${fmtDate(t.reqDate)}</td>
        <td style="${tdS}">${fmtDate(t.doneDate)}</td>
        <td style="${tdS}">${leadLabel(t)}${t.asap ? ' (ASAP)' : ''}</td>
        <td style="${tdS}">${t.note || ''}</td>
      </tr>`;
    });
    html += '</tbody></table>';
  }
  html += '</div>';
  return html;
}
