import React, { useState, useEffect } from 'react';
import { CAT, PKG_LABELS } from '../utils/constants';
import { api, getSteps, isCustomCat, toRow } from '../utils/helpers';

const INIT_TASK = {
  name: '', cat: 'pkg', reqDate: '', dueDate: '', asap: false,
  status: 'waiting', note: '', ttype: 'new', pkgType: '', ecnt: 0, steps: [],
};

export default function TaskModal({ task, tasks, onClose, onSaved, showToast }) {
  const isEdit = !!task;
  const [form, setForm]     = useState(INIT_TASK);
  const [csteps, setCsteps] = useState([]);
  const [ctrVal, setCtrVal] = useState(0);

  useEffect(() => {
    if (task) {
      setForm({
        name: task.name, cat: task.cat, reqDate: task.reqDate, dueDate: task.dueDate,
        asap: task.asap, status: task.status, note: task.note, ttype: task.ttype,
        pkgType: task.pkgType, ecnt: task.ecnt, steps: task.steps,
      });
      setCtrVal(task.ecnt || 0);
      if (isCustomCat(task.cat)) {
        setCsteps(task.steps.filter(x => x && typeof x === 'object').map(x => ({ name: x.name, done: x.done })));
      } else {
        setCsteps(task.steps.map(v => {
          if (v && typeof v === 'object' && !Array.isArray(v)) return v;
          return { done: !!v, dates: [] };
        }));
      }
    } else {
      setForm({ ...INIT_TASK, reqDate: new Date().toISOString().slice(0, 10) });
      setCsteps([]);
      setCtrVal(0);
    }
  }, [task]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const catSteps = getSteps(form.cat);
  const isCust   = isCustomCat(form.cat);
  const showEdit  = form.cat !== 'project';
  const showVari  = form.cat !== 'project';

  function getStepObj(i) {
    const v = csteps[i];
    if (v && typeof v === 'object' && !Array.isArray(v)) return v;
    return { done: !!v, dates: [] };
  }

  function togS(i) {
    const obj = getStepObj(i);
    const updated = { ...obj, done: !obj.done };
    if (updated.done && (!obj.dates || !obj.dates.length)) {
      const now = new Date();
      updated.dates = [(now.getMonth() + 1) + '.' + now.getDate()];
    }
    setCsteps(prev => { const n = [...prev]; n[i] = updated; return n; });
  }

  function addStepDate(i) {
    const d = prompt('날짜 입력 (예: 4.15)', '');
    if (!d || !d.trim()) return;
    const obj = getStepObj(i);
    const updated = { ...obj, dates: [...(obj.dates || []), d.trim()] };
    setCsteps(prev => { const n = [...prev]; n[i] = updated; return n; });
  }

  function removeStepDate(i, di) {
    const obj = getStepObj(i);
    const dates = [...(obj.dates || [])];
    dates.splice(di, 1);
    setCsteps(prev => { const n = [...prev]; n[i] = { ...obj, dates }; return n; });
  }

  function togG(i) {
    const its = csteps.filter(x => x && typeof x === 'object');
    its[i] = { ...its[i], done: !its[i].done };
    setCsteps(its);
  }

  function addCStep(val) {
    if (!val) return;
    setCsteps(prev => [...prev, { name: val, done: false }]);
  }

  function delCS(i) {
    const its = csteps.filter(x => x && typeof x === 'object');
    its.splice(i, 1);
    setCsteps(its);
  }

  async function save() {
    if (!form.name.trim()) return;
    const sArr = catSteps;
    let steps;
    if (form.ttype === 'edit') {
      steps = [];
    } else if (isCust) {
      steps = csteps.filter(x => x && typeof x === 'object');
    } else {
      const padded = [...csteps];
      while (padded.length < sArr.length) padded.push(0);
      steps = padded.slice(0, sArr.length).map(v => {
        if (v && typeof v === 'object' && !Array.isArray(v)) return v;
        return { done: !!v, dates: [] };
      });
    }
    const data = {
      name: form.name.trim(), cat: form.cat, reqDate: form.reqDate,
      dueDate: form.asap ? '' : form.dueDate, asap: form.asap,
      status: form.status, steps, note: form.note.trim(),
      ttype: form.ttype, ecnt: form.ttype === 'edit' ? ctrVal : 0,
      pkgType: form.pkgType,
    };
    onClose();
    showToast('저장 중...');
    try {
      if (task) {
        await api('tasks?id=eq.' + task.id, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(toRow(data)) });
      } else {
        await api('tasks', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(toRow(data)) });
      }
      await onSaved();
    } catch (e) { showToast('저장 실패: ' + e.message, true); }
  }

  async function delTask() {
    if (!task) return;
    if (!confirm('이 태스크를 삭제할까요?')) return;
    onClose();
    showToast('삭제 중...');
    try {
      await api('tasks?id=eq.' + task.id, { method: 'DELETE' });
      await onSaved();
    } catch (e) { showToast('삭제 실패: ' + e.message, true); }
  }

  async function copyTask() {
    if (!task) return;
    onClose();
    showToast('복사 중...');
    const sc = task.ttype === 'edit' ? [] : isCust
      ? task.steps.filter(x => x && typeof x === 'object').map(x => ({ name: x.name, done: false }))
      : getSteps(task.cat).map(() => 0);
    const data = {
      name: task.name + ' (복사)', cat: task.cat, reqDate: new Date().toISOString().slice(0, 10),
      dueDate: '', asap: false, status: 'waiting', steps: sc,
      note: '', ttype: task.ttype, ecnt: 0, pkgType: task.pkgType || '',
    };
    try {
      await api('tasks', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(toRow(data)) });
      await onSaved();
    } catch (e) { showToast('복사 실패: ' + e.message, true); }
  }

  const custSteps = csteps.filter(x => x && typeof x === 'object');

  return (
    <div className="ovl" style={{ display: 'flex' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhd">
          <div>
            <div className="mhd-t">{task ? task.name : '새 태스크'}</div>
            {task && <div className="mhd-s">{(CAT[task.cat] || { l: '' }).l + ' · ' + { waiting: '대기', inprogress: '진행중', hold: '홀드', done: '완료' }[task.status]}</div>}
          </div>
          <button className="xbtn" onClick={onClose}>✕</button>
        </div>

        <div className="mbd">
          {form.status === 'hold' && (
            <div className="hban" style={{ display: 'flex' }}>⚠️ 홀드 상태입니다. 비고에 사유를 기록해두세요.</div>
          )}

          <div className="two">
            <div className="fg">
              <label className="fl">프로젝트명</label>
              <input className="fi" placeholder="[견과] 신제품" value={form.name}
                onChange={e => set('name', e.target.value)} />
            </div>
            <div className="fg">
              <label className="fl">카테고리</label>
              <select className="fs" value={form.cat}
                onChange={e => { set('cat', e.target.value); if (e.target.value === 'project') set('ttype', 'new'); }}>
                <option value="pkg">📦 패키지 디자인</option>
                <option value="video">🎬 영상 디자인</option>
                <option value="project">🗂 프로젝트</option>
                <option value="general">📋 일반 업무</option>
              </select>
            </div>
          </div>

          <div className="fg">
            <label className="fl">업무 타입</label>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: '#1C1A16' }}>
                <input type="radio" name="ttype" value="new" checked={form.ttype === 'new'}
                  onChange={() => set('ttype', 'new')} /> 신규
              </label>
              {showEdit && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: '#1C1A16' }}>
                  <input type="radio" name="ttype" value="edit" checked={form.ttype === 'edit'}
                    onChange={() => set('ttype', 'edit')} /> 수정
                </label>
              )}
              {showVari && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: '#1C1A16' }}>
                  <input type="radio" name="ttype" value="variation" checked={form.ttype === 'variation'}
                    onChange={() => set('ttype', 'variation')} /> 베리에이션
                </label>
              )}
            </div>
          </div>

          {form.cat === 'pkg' && (
            <div className="fg">
              <label className="fl">패키지 형태</label>
              <select className="fs" value={form.pkgType} onChange={e => set('pkgType', e.target.value)}>
                <option value="">선택 안함</option>
                {Object.entries(PKG_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          )}

          <div className="two">
            <div className="fg">
              <label className="fl">요청일</label>
              <input className="fi" type="date" value={form.reqDate} onChange={e => set('reqDate', e.target.value)} />
            </div>
            <div className="fg">
              <label className="fl">기한</label>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input className="fi" type="date" value={form.dueDate} style={{ flex: 1 }}
                  onChange={e => set('dueDate', e.target.value)} disabled={form.asap} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#9A9590', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.asap}
                    onChange={e => { set('asap', e.target.checked); if (e.target.checked) set('dueDate', ''); }} />
                  ASAP
                </label>
              </div>
            </div>
          </div>

          <div className="fg">
            <label className="fl">상태</label>
            <select className="fs" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="waiting">대기</option>
              <option value="inprogress">진행중</option>
              <option value="hold">홀드</option>
              <option value="done">완료</option>
            </select>
          </div>

          <div className="fg">
            <label className="fl">비고</label>
            <textarea className="fta" placeholder="진행 현황, 홀드 사유, 수정 히스토리 등..." value={form.note}
              onChange={e => set('note', e.target.value)} />
          </div>

          {form.ttype === 'edit' && (
            <div className="fg">
              <label className="fl">수정 횟수</label>
              <div className="ctr">
                <button className="ctr-btn" onClick={() => setCtrVal(v => Math.max(0, v - 1))}>−</button>
                <div className="ctr-num">{ctrVal}</div>
                <button className="ctr-btn" onClick={() => setCtrVal(v => v + 1)}>+</button>
                <span style={{ fontSize: 12, color: '#9A9590' }}>회</span>
              </div>
            </div>
          )}

          {form.ttype !== 'edit' && (
            <div className="ss">
              <div className="st">{isCust ? '할 일 체크리스트' : (form.cat === 'pkg' ? '패키지 단계 체크리스트' : '영상 단계 체크리스트')}</div>
              <div>
                {isCust ? (
                  custSteps.map((it, i) => (
                    <div className="si" key={i}>
                      <div className={'sc2' + (it.done ? ' on' : '')} onClick={() => togG(i)}>
                        {it.done ? '✓' : ''}
                      </div>
                      <span className={'sn' + (it.done ? ' done' : '')}>{it.name}</span>
                      <span onClick={() => delCS(i)} style={{ marginLeft: 'auto', cursor: 'pointer', fontSize: 14, color: '#9A9590', padding: '0 4px' }}>✕</span>
                    </div>
                  ))
                ) : (
                  catSteps.map((nm, i) => {
                    const obj = getStepObj(i);
                    return (
                      <div className="si" key={i} style={{ flexWrap: 'wrap', gap: 4 }}>
                        <div className={'sc2' + (obj.done ? ' on' : '')} onClick={() => togS(i)}>
                          {obj.done ? '✓' : ''}
                        </div>
                        <span className={'sn' + (obj.done ? ' done' : '')} style={{ minWidth: 120 }}>{i + 1}. {nm}</span>
                        <div className="step-dates">
                          {(obj.dates || []).map((d, di) => (
                            <span key={di} className="step-date-tag" onClick={() => removeStepDate(i, di)}>{d} ✕</span>
                          ))}
                          <button className="step-add-date" onClick={() => addStepDate(i)}>+ 날짜</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {isCust && (
                <div id="cl-add" style={{ display: 'block', marginTop: 8 }}>
                  <CustomStepInput onAdd={addCStep} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mft">
          {task && <button className="btn" style={{ display: 'inline-flex', marginRight: 'auto', color: '#E24B4A', borderColor: '#F09595' }} onClick={delTask}>삭제</button>}
          {task && <button className="btn" onClick={copyTask}>복사</button>}
          <button className="btn" onClick={onClose}>취소</button>
          <button className="btn btn-p" onClick={save}>저장</button>
        </div>
      </div>
    </div>
  );
}

function CustomStepInput({ onAdd }) {
  const [val, setVal] = useState('');
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <input className="fi" placeholder="할 일 입력 후 Enter" value={val}
        style={{ flex: 1, fontSize: 12, padding: '6px 8px' }}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { onAdd(val.trim()); setVal(''); } }} />
      <button className="btn btn-sm" onClick={() => { onAdd(val.trim()); setVal(''); }}>추가</button>
    </div>
  );
}
