import React, { useState, useEffect, useCallback } from 'react';
import LockScreen from './components/LockScreen';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import TaskModal from './components/TaskModal';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import MeetingNotes from './pages/MeetingNotes';
import CompletedWork from './pages/CompletedWork';
import { useAppData } from './hooks/useAppData';
import { printTasksHtml } from './utils/helpers';

export default function App() {
  const [authed, setAuthed]     = useState(sessionStorage.getItem('auth') === '1');
  const [curPage, setCurPage]   = useState('dashboard');
  const [taskModal, setTaskModal] = useState(null); // null=closed, { task, cat }
  const [taskFilter, setTaskFilter] = useState(null);

  const {
    tasks, meetings, mtItems, leaves,
    toast, showToast, hideToast,
    loadAll, reloadLeaves, reloadMeetings,
  } = useAppData();

  useEffect(() => {
    if (authed) loadAll();
  }, [authed]);

  function goPage(p) {
    setCurPage(p);
    setTaskFilter(null);
  }

  function goTaskFilter(f) {
    setTaskFilter(f);
    setCurPage('tasks');
  }

  function openTask(id, cat) {
    if (id) {
      const t = tasks.find(x => x.id === id);
      if (t) setTaskModal({ task: t });
    } else {
      setTaskModal({ task: null, defaultCat: cat || 'pkg' });
    }
  }

  function printCurrent() {
    const area = document.getElementById('print-area');
    const html = printTasksHtml(tasks, curPage);
    area.innerHTML = html;
    area.style.display = 'block';
    setTimeout(() => { window.print(); area.style.display = 'none'; }, 150);
  }

  if (!authed) {
    return <LockScreen onUnlock={() => setAuthed(true)} />;
  }

  return (
    <div className="app" style={{ display: 'flex' }}>
      <Sidebar curPage={curPage} onNav={goPage} onPrint={printCurrent} />

      <div className="main show">
        {curPage === 'dashboard' && (
          <Dashboard tasks={tasks} onGoTaskFilter={goTaskFilter} />
        )}
        {curPage === 'tasks' && (
          <Tasks tasks={tasks} onOpenTask={openTask} filterStatus={taskFilter} />
        )}
        {curPage === 'calendar' && (
          <Calendar tasks={tasks} leaves={leaves} onReloadLeaves={reloadLeaves} showToast={showToast} />
        )}
        {curPage === 'meetings' && (
          <MeetingNotes meetings={meetings} mtItems={mtItems} tasks={tasks} onReload={reloadMeetings} showToast={showToast} />
        )}
        {curPage === 'completed' && (
          <CompletedWork tasks={tasks} onOpenTask={openTask} />
        )}
      </div>

      {taskModal !== null && (
        <TaskModal
          task={taskModal.task}
          tasks={tasks}
          onClose={() => setTaskModal(null)}
          onSaved={async () => { await loadAll(); }}
          showToast={showToast}
        />
      )}

      <Toast {...toast} />
      <div id="print-area" style={{ display: 'none' }} />
    </div>
  );
}
