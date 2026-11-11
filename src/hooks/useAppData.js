import { useState, useCallback } from 'react';
import { api, mapTask } from '../utils/helpers';

export function useAppData() {
  const [tasks, setTasks]     = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [mtItems, setMtItems]  = useState([]);
  const [leaves, setLeaves]    = useState([]);
  const [events, setEvents]    = useState([]);
  const [toast, setToast]      = useState({ msg: '', err: false, show: false });

  const showToast = useCallback((msg, err = false) => {
    setToast({ msg, err, show: true });
    if (err) setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  }, []);

  const hideToast = useCallback(() => {
    setToast(t => ({ ...t, show: false }));
  }, []);

  const loadAll = useCallback(async () => {
    showToast('불러오는 중...');
    try {
      const [td, md, mid, ld, ed] = await Promise.all([
        api('tasks?order=created_at.desc'),
        api('meetings?order=meet_date.desc'),
        api('meeting_items?order=created_at.asc'),
        api('leaves?order=leave_date.asc'),
        api('events?order=event_date.asc').catch(() => []),
      ]);
      setTasks((td || []).map(mapTask));
      setMeetings((md || []).map(m => ({ ...m, attendees: m.attendees || '', meet_date: String(m.meet_date || '').trim() })));
      setMtItems(mid || []);
      setLeaves(ld || []);
      setEvents(ed || []);
      hideToast();
    } catch (e) {
      showToast('불러오기 실패: ' + e.message, true);
    }
  }, [showToast, hideToast]);

  const reloadLeaves = useCallback(async () => {
    const ld = await api('leaves?order=leave_date.asc');
    setLeaves(ld || []);
  }, []);

  const reloadEvents = useCallback(async () => {
    const ed = await api('events?order=event_date.asc');
    setEvents(ed || []);
  }, []);

  const reloadMeetings = useCallback(async () => {
    const [md, mid] = await Promise.all([
      api('meetings?order=meet_date.desc'),
      api('meeting_items?order=created_at.asc'),
    ]);
    setMeetings((md || []).map(m => ({ ...m, attendees: m.attendees || '', meet_date: String(m.meet_date || '').trim() })));
    setMtItems(mid || []);
  }, []);

  return {
    tasks, setTasks,
    meetings, setMeetings,
    mtItems, setMtItems,
    leaves, setLeaves,
    events,
    toast,
    showToast, hideToast,
    loadAll,
    reloadLeaves,
    reloadEvents,
    reloadMeetings,
  };
}
