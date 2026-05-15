import React, { useState } from 'react';
import { CAT } from '../utils/constants';
import { isCustomCat, getSteps, pct } from '../utils/helpers';
import TaskTable from '../components/TaskTable';

const VIEWS = [
  { id: 'cat', label: '카테고리별' },
  { id: 'due', label: '마감일순' },
  { id: 'req', label: '요청일순' },
  { id: 'all', label: '전체 목록' },
];

export default function Tasks({ tasks, onOpenTask, filterStatus }) {
  const [tv, setTv] = useState(filterStatus ? 'all' : 'cat');

  const active = filterStatus === 'asap'
    ? tasks.filter(t => t.asap && t.status !== 'done')
    : filterStatus
      ? tasks.filter(t => t.status === filterStatus)
      : tasks.filter(t => t.status !== 'done');

  function renderContent() {
    if (tv === 'cat') {
      return Object.entries(CAT).map(([key, meta]) => {
        const rows = active.filter(t => t.cat === key);
        return (
          <div key={key} className="tcat">
            <div className="tcat-hd">
              <span className="tcat-ico">{meta.i}</span>
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
