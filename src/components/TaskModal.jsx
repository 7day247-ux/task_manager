import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { CAT, TYPE_LABELS, TYPE_FIELD_LABEL, ITEM_SUGGEST, POSM_LABELS, PRODUCT_LINE } from '../utils/constants';
import ImageGrid, { UploadButton } from './ImageGrid';
import { api, getSteps, isCustomCat, toRow, leadLabel, today } from '../utils/helpers';

const INIT_TASK = {
  name: '', cat: 'pkg', reqDate: '', dueDate: '', asap: false,
  status: 'waiting', note: '', ttype: 'new', pkgType: '', ecnt: 0, steps: [], doneDate: '', reqTime: '', doneTime: '',
  items: [], proposalCount: 0, finalType: '', projectId: null,
};

export default function TaskModal({ task, tasks, projects = [], images = [], onReloadImages, defaultCat, onClose, onSaved, showToast }) {
  const isEdit = !!task;
  const [form, setForm]     = useState(() => (!task && defaultCat ? { ...INIT_TASK, cat: defaultCat } : INIT_TASK));
  const [csteps, setCsteps] = useState([]);
  const [ctrVal, setCtrVal] = useState(0);
  const [newProjects, setNewProjects] = useState([]);
  const [np, setNp] = useState(null); // 새 제품 입력 중일 때 { name, line, kind }

  useEffect(() => {
    if (task) {
      setForm({
        name: task.name, cat: task.cat, reqDate: task.reqDate, dueDate: task.dueDate,
        asap: task.asap, status: task.status, note: task.note, ttype: task.ttype,
        pkgType: task.pkgType, ecnt: task.ecnt, steps: task.steps, doneDate: task.doneDate || '',
        reqTime: task.reqTime || '', doneTime: task.doneTime || '',
        items: task.items || [], proposalCount: task.proposalCount || 0,
        finalType: task.finalType || '', projectId: task.projectId || null,
      });
      setCtrVal(task.ecnt || 0);
      if (isCustomCat(task.cat)) {
        setCsteps(task.steps.filter(x => x && typeof x === 'object' && x.name).map(x => ({ name: x.name, done: x.done })));
      } else {
        setCsteps(task.steps.map(v => {
          if (v && typeof v === 'object' && !Array.isArray(v)) return v;
          return { done: !!v, dates: [] };
        }));
      }
    } else {
      setForm({ ...INIT_TASK, cat: defaultCat || 'pkg', reqDate: today() });
      setCsteps([]);
      setCtrVal(0);
    }
  }, [task]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const catSteps = getSteps(form.cat);
  const isCust   = isCustomCat(form.cat);
  const showEdit  = form.cat !== 'project';
  const showVari  = form.cat !== 'project';

  // ── 작업 구성 (종류 + 개수) ──
  const allProjects = [...projects, ...newProjects];
  const curProject  = allProjects.find(p => p.id === form.projectId);
  const suggest = form.cat === 'general' ? []
    : form.cat === 'posm' ? Object.values(POSM_LABELS).filter(v => v !== '기타')
    : curProject && ITEM_SUGGEST[curProject.line] ? ITEM_SUGGEST[curProject.line]
    : [...ITEM_SUGGEST.dry, ...ITEM_SUGGEST.ice];
  const itemSum = form.items.reduce((s, x) => s + x.count, 0);

  function addItem(name) {
    name = (name || '').trim();
    if (!name) return;
    setForm(f => {
      const i = f.items.findIndex(x => x.name === name);
      const items = i >= 0
        ? f.items.map((x, j) => j === i ? { ...x, count: x.count + 1 } : x)
        : [...f.items, { name, count: 1 }];
      return { ...f, items };
    });
  }

  function bumpItem(i, d) {
    setForm(f => {
      const items = f.items.map((x, j) => j === i ? { ...x, count: x.count + d } : x).filter(x => x.count > 0);
      const finalType = items.some(x => x.name === f.finalType) ? f.finalType : '';
      return { ...f, items, finalType };
    });
  }

  async function createProject() {
    if (!np || !np.name.trim()) return;
    try {
      const rows = await api('projects', {
        method: 'POST', headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ name: np.name.trim(), kind: np.kind, line: np.line, status: 'active' }),
      });
      if (rows && rows[0]) {
        setNewProjects(prev => [...prev, rows[0]]);
        set('projectId', rows[0].id);
      }
      setNp(null);
    } catch (e) { showToast('제품 추가 실패: ' + e.message, true); }
  }

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
      steps = csteps.filter(x => x && typeof x === 'object' && x.name);
    } else {
      const padded = [...csteps];
      while (padded.length < sArr.length) padded.push(0);
      steps = padded.slice(0, sArr.length).map(v => {
        if (v && typeof v === 'object' && !Array.isArray(v)) return { done: !!v.done, dates: v.dates || [] };
        return { done: !!v, dates: [] };
      });
    }
    const data = {
      name: form.name.trim(), cat: form.cat, reqDate: form.reqDate,
      dueDate: form.asap ? '' : form.dueDate, asap: form.asap,
      status: form.status, steps, note: form.note.trim(),
      ttype: form.ttype, ecnt: ctrVal,
      pkgType: form.pkgType,
      doneDate: form.status === 'done' ? (form.doneDate || today()) : '',
      reqTime: form.reqTime, doneTime: form.doneTime,
      items: form.items, proposalCount: form.proposalCount,
      finalType: form.finalType, projectId: form.projectId,
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
      name: task.name + ' (복사)', cat: task.cat, reqDate: today(),
      dueDate: '', asap: false, status: 'waiting', steps: sc,
      note: '', ttype: task.ttype, ecnt: 0, pkgType: task.pkgType || '', doneDate: '', reqTime: '', doneTime: '',
      items: task.items || [], proposalCount: 0, finalType: '', projectId: task.projectId || null,
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
          <button className="xbtn" onClick={onClose} aria-label="닫기"><Icon name="x" size={20} /></button>
        </div>

        <div className="mbd">
          {form.status === 'hold' && (
            <div className="hban" style={{ display: 'flex' }}><Icon name="alert" size={15} /> 홀드 상태입니다. 비고에 사유를 기록해두세요.</div>
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
                onChange={e => { set('cat', e.target.value); set('pkgType', ''); if (e.target.value === 'project') set('ttype', 'new'); }}>
                <option value="pkg">패키지 디자인</option>
                <option value="inhouse">사내 디자인</option>
                <option value="posm">POSM</option>
                <option value="project">프로젝트</option>
                <option value="general">일반 업무</option>
              </select>
            </div>
          </div>

          <div className="fg">
            <label className="fl">업무 타입</label>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: '#111111' }}>
                <input type="radio" name="ttype" value="new" checked={form.ttype === 'new'}
                  onChange={() => set('ttype', 'new')} /> 신규
              </label>
              {showEdit && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: '#111111' }}>
                  <input type="radio" name="ttype" value="edit" checked={form.ttype === 'edit'}
                    onChange={() => set('ttype', 'edit')} /> 수정
                </label>
              )}
              {showVari && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: '#111111' }}>
                  <input type="radio" name="ttype" value="variation" checked={form.ttype === 'variation'}
                    onChange={() => set('ttype', 'variation')} /> 베리에이션
                </label>
              )}
            </div>
          </div>

          {form.cat !== 'general' && (
            <div className="fg">
              <label className="fl">제품 (선택)</label>
              <div className="dt-row">
                <select className="fs" style={{ flex: 1, minWidth: 0 }} value={form.projectId || ''}
                  onChange={e => set('projectId', e.target.value ? parseInt(e.target.value) : null)}>
                  <option value="">연결 안함</option>
                  {allProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}{PRODUCT_LINE[p.line] ? ' · ' + PRODUCT_LINE[p.line] : ''}</option>
                  ))}
                </select>
                {!np && <button type="button" className="btn btn-sm" onClick={() => setNp({ name: '', line: 'dry', kind: 'new' })}>+ 새 제품</button>}
              </div>
              {np && (
                <div className="np-box">
                  <input className="fi" placeholder="제품명" value={np.name} autoFocus
                    onChange={e => setNp({ ...np, name: e.target.value })}
                    onKeyDown={e => { if (e.key === 'Enter') createProject(); }} />
                  <div className="dt-row">
                    <select className="fs" style={{ flex: 1 }} value={np.line} onChange={e => setNp({ ...np, line: e.target.value })}>
                      <option value="dry">건과</option>
                      <option value="ice">빙과</option>
                      <option value="">기타</option>
                    </select>
                    <select className="fs" style={{ flex: 1 }} value={np.kind} onChange={e => setNp({ ...np, kind: e.target.value })}>
                      <option value="new">신제품</option>
                      <option value="renewal">리뉴얼</option>
                    </select>
                    <button type="button" className="btn btn-sm" onClick={() => setNp(null)}>취소</button>
                    <button type="button" className="btn btn-sm btn-p" onClick={createProject}>추가</button>
                  </div>
                </div>
              )}
              <div className="fhint">같은 제품의 파우치·볼케이스·외박스를 묶어두면 완료 현황에서 제품 1개의 리드타임으로 볼 수 있어요.</div>
            </div>
          )}

          {TYPE_LABELS[form.cat] && (
            <div className="fg">
              <label className="fl">{TYPE_FIELD_LABEL[form.cat]}</label>
              <select className="fs" value={form.pkgType} onChange={e => set('pkgType', e.target.value)}>
                <option value="">선택 안함</option>
                {Object.entries(TYPE_LABELS[form.cat]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          )}

          <div className="two">
            <div className="fg">
              <label className="fl">요청일 · 시간(선택)</label>
              <div className="dt-row">
                <input className="fi" type="date" value={form.reqDate} onChange={e => set('reqDate', e.target.value)} />
                <input className="fi fi-time" type="time" value={form.reqTime} onChange={e => set('reqTime', e.target.value)} />
              </div>
            </div>
            <div className="fg">
              <label className="fl">기한</label>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input className="fi" type="date" value={form.dueDate} style={{ flex: 1 }}
                  onChange={e => set('dueDate', e.target.value)} disabled={form.asap} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#8A8A8A', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.asap}
                    onChange={e => { set('asap', e.target.checked); if (e.target.checked) set('dueDate', ''); }} />
                  ASAP
                </label>
              </div>
            </div>
          </div>

          <div className="fg">
            <label className="fl">상태</label>
            <select className="fs" value={form.status}
              onChange={e => { set('status', e.target.value); if (e.target.value === 'done' && !form.doneDate) set('doneDate', today()); }}>
              <option value="waiting">대기</option>
              <option value="inprogress">진행중</option>
              <option value="hold">홀드</option>
              <option value="done">완료</option>
            </select>
          </div>

          {form.status === 'done' && (
            <div className="fg">
              <label className="fl">완료일 (최종 데이터 이관일)</label>
              <div className="dt-row">
                <input className="fi" type="date" value={form.doneDate}
                  onChange={e => set('doneDate', e.target.value)} />
                <input className="fi fi-time" type="time" value={form.doneTime} onChange={e => set('doneTime', e.target.value)} />
                <span className="lead-chip">리드타임 {leadLabel(form)}</span>
              </div>
              <div className="fhint">리드타임은 주말·공휴일을 뺀 근무일 기준이에요. 당일에 끝난 일은 시간을 적으면 소요 시간으로 보여요.</div>
            </div>
          )}

          <div className="fg">
            <label className="fl">작업 구성 {form.items.length > 0 && <span className="it-sum">총 {itemSum}개</span>}</label>
            {form.items.length > 0 && (
              <div className="it-list">
                {form.items.map((it, i) => (
                  <div className="it-row" key={it.name}>
                    <span className="it-name">{it.name}</span>
                    <button type="button" className="ctr-btn it-btn" onClick={() => bumpItem(i, -1)}>−</button>
                    <span className="it-cnt">{it.count}</span>
                    <button type="button" className="ctr-btn it-btn" onClick={() => bumpItem(i, 1)}>+</button>
                  </div>
                ))}
              </div>
            )}
            {suggest.length > 0 && (
              <div className="it-sug">
                {suggest.map(s => <button type="button" key={s} className="chip" onClick={() => addItem(s)}>+ {s}</button>)}
              </div>
            )}
            <ItemInput onAdd={addItem} />
            <div className="fhint">한 요청에서 만든 종류와 개수예요. 누를 때마다 1개씩 늘어나요. 비워두면 1개로 세요.</div>
          </div>

          {form.cat !== 'general' && (
            <div className="two">
              <div className="fg">
                <label className="fl">제안 시안 수</label>
                <div className="ctr">
                  <button type="button" className="ctr-btn" onClick={() => set('proposalCount', Math.max(0, form.proposalCount - 1))}>−</button>
                  <div className="ctr-num">{form.proposalCount}</div>
                  <button type="button" className="ctr-btn" onClick={() => set('proposalCount', form.proposalCount + 1)}>+</button>
                  <span style={{ fontSize: 12, color: '#8A8A8A' }}>안 · 처음 제안한 시안</span>
                </div>
              </div>
              {form.cat === 'pkg' && form.items.length > 0 && (
                <div className="fg">
                  <label className="fl">최종 확정 타입</label>
                  <select className="fs" value={form.finalType} onChange={e => set('finalType', e.target.value)}>
                    <option value="">아직 미정</option>
                    {form.items.map(it => <option key={it.name} value={it.name}>{it.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="fg">
            <label className="fl">수정 횟수</label>
            <div className="ctr">
              <button type="button" className="ctr-btn" onClick={() => setCtrVal(v => Math.max(0, v - 1))}>−</button>
              <div className="ctr-num">{ctrVal}</div>
              <button type="button" className="ctr-btn" onClick={() => setCtrVal(v => v + 1)}>+</button>
              <span style={{ fontSize: 12, color: '#8A8A8A' }}>회 · 수정 요청을 받을 때마다 +1</span>
            </div>
          </div>

          {form.cat !== 'general' && (
            <div className="fg">
              <label className="fl">이미지</label>
              {task ? (
                <>
                  {['final', 'mood'].map(k => {
                    const list = images.filter(i => i.task_id === task.id && i.kind === k);
                    return list.length > 0 && (
                      <div key={k} className="ti-grp">
                        <div className="ti-lbl">{k === 'final' ? '최종 디자인' : '무드보드'} {list.length}장</div>
                        <ImageGrid small images={list} onChanged={onReloadImages} showToast={showToast} />
                      </div>
                    );
                  })}
                  <div className="dt-row">
                    <UploadButton label="+ 최종 디자인" kind="final" taskId={task.id} projectId={form.projectId} onDone={onReloadImages} showToast={showToast} />
                    <UploadButton label="+ 무드보드" kind="mood" taskId={task.id} projectId={form.projectId} onDone={onReloadImages} showToast={showToast} />
                  </div>
                </>
              ) : (
                <div className="fhint" style={{ marginTop: 0 }}>태스크를 저장한 뒤 다시 열면 최종 디자인과 무드보드를 올릴 수 있어요.</div>
              )}
            </div>
          )}

          <div className="fg">
            <label className="fl">비고</label>
            <textarea className="fta" placeholder="진행 현황, 홀드 사유, 수정 히스토리 등..." value={form.note}
              onChange={e => set('note', e.target.value)} />
          </div>

          {form.ttype !== 'edit' && (
            <div className="ss">
              <div className="st">{isCust ? '할 일 체크리스트' : '패키지 단계 체크리스트'}</div>
              <div>
                {isCust ? (
                  custSteps.map((it, i) => (
                    <div className="si" key={i}>
                      <div className={'sc2' + (it.done ? ' on' : '')} onClick={() => togG(i)}>
                        {it.done ? <Icon name="check" size={12} stroke={2.5} /> : ''}
                      </div>
                      <span className={'sn' + (it.done ? ' done' : '')}>{it.name}</span>
                      <span onClick={() => delCS(i)} style={{ marginLeft: 'auto', cursor: 'pointer', fontSize: 14, color: '#8A8A8A', padding: '0 4px', display: 'inline-flex' }}><Icon name="x" size={14} /></span>
                    </div>
                  ))
                ) : (
                  catSteps.map((nm, i) => {
                    const obj = getStepObj(i);
                    return (
                      <div className="si" key={i} style={{ flexWrap: 'wrap', gap: 4 }}>
                        <div className={'sc2' + (obj.done ? ' on' : '')} onClick={() => togS(i)}>
                          {obj.done ? <Icon name="check" size={12} stroke={2.5} /> : ''}
                        </div>
                        <span className={'sn' + (obj.done ? ' done' : '')} style={{ minWidth: 120 }}>{i + 1}. {nm}</span>
                        <div className="step-dates">
                          {(obj.dates || []).map((d, di) => (
                            <span key={di} className="step-date-tag" onClick={() => removeStepDate(i, di)}>{d} <Icon name="x" size={10} /></span>
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

function ItemInput({ onAdd }) {
  const [val, setVal] = useState('');
  const add = () => { onAdd(val); setVal(''); };
  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
      <input className="fi" placeholder="목록에 없으면 직접 입력" value={val}
        style={{ flex: 1, fontSize: 12, padding: '6px 8px' }}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
      <button type="button" className="btn btn-sm" onClick={add}>추가</button>
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
