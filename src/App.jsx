import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import LockScreen from './components/LockScreen';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import TaskModal from './components/TaskModal';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import MeetingNotes from './pages/MeetingNotes';
import CompletedWork from './pages/CompletedWork';
import Reflection from './pages/Reflection';
import { useAppData } from './hooks/useAppData';
import { printTasksHtml } from './utils/helpers';

const PATH_TO_PAGE = {
  '/':           'dashboard',
  '/tasks':      'tasks',
  '/calendar':   'calendar',
  '/meetings':   'meetings',
  '/completed':  'completed',
  '/reflection': 'reflection',
};
const PAGE_TO_PATH = {
  dashboard:  '/',
  tasks:      '/tasks',
  calendar:   '/calendar',
  meetings:   '/meetings',
  completed:  '/completed',
  reflection: '/reflection',
};

function AppInner() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [authed, setAuthed] = useState(sessionStorage.getItem('auth') === '1');
  const [taskModal, setTaskModal]   = useState(null);
  const [taskFilter, setTaskFilter] = useState(null);

  const {
    tasks, meetings, mtItems, leaves,
    toast, showToast,
    loadAll, reloadLeaves, reloadMeetings,
  } = useAppData();

  useEffect(() => {
    if (authed) loadAll();
  }, [authed]);

  // 현재 URL에서 페이지 ID 계산
  const curPage = PATH_TO_PAGE[location.pathname] || 'dashboard';

  function goPage(p) {
    setTaskFilter(null);
    navigate(PAGE_TO_PATH[p] || '/');
  }

  function goTaskFilter(f) {
    setTaskFilter(f);
    navigate('/tasks');
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
        <Routes>
          <Route path="/" element={
            <Dashboard tasks={tasks} onGoTaskFilter={goTaskFilter} />
          } />
          <Route path="/tasks" element={
            <Tasks tasks={tasks} onOpenTask={openTask} filterStatus={taskFilter} />
          } />
          <Route path="/calendar" element={
            <Calendar tasks={tasks} leaves={leaves} onReloadLeaves={reloadLeaves} showToast={showToast} />
          } />
          <Route path="/meetings" element={
            <MeetingNotes meetings={meetings} mtItems={mtItems} tasks={tasks} onReload={reloadMeetings} showToast={showToast} />
          } />
          <Route path="/completed" element={
            <CompletedWork tasks={tasks} onOpenTask={openTask} />
          } />
          <Route path="/reflection" element={
            <Reflection showToast={showToast} />
          } />
          {/* 알 수 없는 경로는 대시보드로 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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

export default function App() {
  return <AppInner />;
}
