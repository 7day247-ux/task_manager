import React, { useState } from 'react';
import Icon from '../components/Icon';
import { CAT } from '../utils/constants';
import { isCustomCat, getSteps, pct, openPause, pausedWorkdays, elapsedDays } from '../utils/helpers';
import TaskTable from '../components/TaskTable';

const VIEWS = [
  { id: 'cat', label: '카테고리별' },
  { id: 'due', label: '마감일순' },
  { id: 'req', label: '요청일순' },
  { id: 'all', label: '전체 목록' },
  { id: 'hold', label: '홀드' },
  { id: 'drop', label: '드롭' },
];

const md = d => (d ? d.slice(5).replace('-', '.') : '');

export default function Tasks({ tasks, onOpenTask, filterStatus }) {
  const [tv, setTv] = useState(filterStatus === 'hold' ? 'hold' : filterStatus ? 'all' : 'cat');

  const active = filterStatus === 'asap'
    ? tasks.filter(t => t.asap && t.status !== 'done')
    : filterStatus
      ? tasks.filter(t => t.status === filterStatus)
      : tasks.filter(t => t.status !== 'done' && t.status !== 'drop');

  function renderContent() {
    if (tv === 'hold' || tv === 'drop') {
      const list = tasks
        .filter(t => t.status === tv)
        .map(t => ({ t, p: openPause(t) }))
        .sort((a, b) => ((b.p && b.p.from) || '').localeCompare((a.p && a.p.from) || ''));
      if (!list.length) return <div className="mt-empty">{tv === 'hold' ? '홀드된 일이 없어요.' : '드롭된 일이 없어요.'}</div>;
      return (
        <div className="hd-list">
          {list.map(({ t, p }) => {
            const el = elapsedDays(t);
            const pd = pausedWorkdays(t);
            return (
              <button key={t.id} className="hd-row" onClick={() => onOpenTask(t.id)}>
                <span className="hd-d">{p ? md(p.from) : '—'}<small>{tv === 'hold' ? '홀드' : '드롭'}</small></span>
                <span className="hd-main">
                  <span className="hd-name">{t.name}<span className={'bdg ' + (CAT[t.cat] || {}).b}>{(CAT[t.cat] || {}).l}</span></span>
                  {p && p.reason && <span className="hd-reason">{p.reason}</span>}
                  <span className="hd-meta">
                    요청 {md(t.reqDate) || '—'}
                    {el !== null && <> · 일한 기간 {el === 0 ? '당일' : el + '일'}</>}
                    {tv === 'hold' && pd > 0 && <> · 멈춘 지 {pd}일</>}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    if (tv === 'cat') {
      return Object.entries(CAT).map(([key, meta]) => {
        const rows = active.filter(t => t.cat === key);
        return (
          <div key={key} className="tcat">
            <div className="tcat-hd">
              <span className="tcat-ico"><Icon name={meta.i} size={18} /></span>
              <span className="tcat-ttl">{meta.l}</span>
              <span className="tcat-cnt">{rows.length}건</span>
              <button className="btn btn-sm btn-p tcat-add" onClick={() => onOpenTask(null, key)}>+ 추가</button>
            </div>
            <div className="ttbl">
              <TaskTable rows={rows} onRowClick={onOpenTask} />
            </div>
          </div>
        );
      });
    }

    const sorted = [...active];
    if (tv === 'due') {
      sorted.sort((a, b) => {
        if (a.asap && !b.asap) return -1;
        if (!a.asap && b.asap) return 1;
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    } else if (tv === 'req') {
      sorted.sort((a, b) => {
        if (!a.reqDate && !b.reqDate) return 0;
        if (!a.reqDate) return 1;
        if (!b.reqDate) return -1;
        return a.reqDate.localeCompare(b.reqDate);
      });
    }

    return (
      <div className="ttbl">
        <TaskTable rows={sorted} onRowClick={onOpenTask} />
      </div>
    );
  }

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="pt">태스크</div>
          <div className="ps">전체 업무 현황</div>
        </div>
        <button className="btn btn-p" onClick={() => onOpenTask(null, 'pkg')}>
          <span>+</span><span className="hide-mobile"> 새 태스크</span>
        </button>
      </div>

      <div className="tb">
        {VIEWS.map(v => (
          <button key={v.id} className={'chip' + (tv === v.id ? ' on' : '')} onClick={() => setTv(v.id)}>
            {v.label}
          </button>
        ))}
      </div>

      <div id="tasks-wrap">{renderContent()}</div>
    </div>
  );
}
