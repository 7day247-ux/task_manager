import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { MOODS, REFLECTION_TAGS } from '../utils/constants';
import { api, today } from '../utils/helpers';

const EMPTY = {
  entry_date: '',
  mood: 'reflect',
  title: '',
  situation: '',
  learned: '',
  next_action: '',
  tags: [],
};

export default function ReflectionModal({ entry, onClose, onSaved, showToast }) {
  const isEdit = !!entry;
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (entry) {
      setForm({
        entry_date:  entry.entry_date || '',
        mood:        entry.mood || 'reflect',
        title:       entry.title || '',
        situation:   entry.situation || '',
        learned:     entry.learned || '',
        next_action: entry.next_action || '',
        tags: entry.tags ? entry.tags.split(',').filter(Boolean) : [],
      });
    } else {
      setForm({ ...EMPTY, entry_date: today() });
    }
  }, [entry]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function toggleTag(id) {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(id) ? f.tags.filter(t => t !== id) : [...f.tags, id],
    }));
  }

  async function save() {
    if (!form.title.trim()) { showToast('제목을 입력해주세요', true); return; }
    if (!form.entry_date)   { showToast('날짜를 선택해주세요', true); return; }
    const row = {
      entry_date:  form.entry_date,
      mood:        form.mood,
      title:       form.title.trim(),
      situation:   form.situation.trim(),
      learned:     form.learned.trim(),
      next_action: form.next_action.trim(),
      tags:        form.tags.join(','),
    };
    onClose();
    showToast('저장 중...');
    try {
      if (isEdit) {
        await api('reflections?id=eq.' + entry.id, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify(row),
        });
      } else {
        await api('reflections', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(row),
        });
      }
      await onSaved();
    } catch (e) { showToast('저장 실패: ' + e.message, true); }
  }

  async function del() {
    if (!entry) return;
    if (!confirm('이 기록을 삭제할까요?')) return;
    onClose();
    showToast('삭제 중...');
    try {
      await api('reflections?id=eq.' + entry.id, { method: 'DELETE' });
      await onSaved();
    } catch (e) { showToast('삭제 실패: ' + e.message, true); }
  }

  const curMood = MOODS.find(m => m.id === form.mood) || MOODS[0];

  return (
    <div className="ovl" style={{ display: 'flex' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
        <div className="mhd" style={{ background: '#F6F6F6', borderRadius: '20px 20px 0 0' }}>
          <div>
            <div className="mhd-t">{isEdit ? '기록 수정' : '새 기록'}</div>
            <div className="mhd-s">Reflection</div>
          </div>
          <button className="xbtn" onClick={onClose} aria-label="닫기"><Icon name="x" size={20} /></button>
        </div>

        <div className="mbd">
          {/* 날짜 + 감정 */}
          <div className="two">
            <div className="fg">
              <label className="fl">날짜</label>
              <input className="fi" type="date" value={form.entry_date}
                onChange={e => set('entry_date', e.target.value)} />
            </div>
            <div className="fg">
              <label className="fl">유형</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                {MOODS.map(m => (
                  <button key={m.id}
                    onClick={() => set('mood', m.id)}
                    style={{
                      padding: '5px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                      border: '1.5px solid',
                      borderColor: form.mood === m.id ? '#111111' : '#E3E3E3',
                      background: form.mood === m.id ? '#F0F0F0' : '#FFFFFF',
                      color: form.mood === m.id ? '#111111' : '#8A8A8A',
                      fontFamily: 'Noto Sans KR, sans-serif',
                    }}>
                    <Icon name={m.icon} size={14} /> {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 한 줄 제목 */}
          <div className="fg">
            <label className="fl">한 줄 제목</label>
            <input className="fi" placeholder="예: 피드백 받을 때 방어적으로 반응했다"
              value={form.title} onChange={e => set('title', e.target.value)} />
          </div>

          {/* 상황 */}
          <div className="fg">
            <label className="fl fl-ico"><Icon name="pin" size={13} /> 상황</label>
            <textarea className="fta" rows={3}
              placeholder="어떤 상황이었나요? 구체적으로 적을수록 좋아요"
              value={form.situation} onChange={e => set('situation', e.target.value)} />
          </div>

          {/* 배운 것 */}
          <div className="fg">
            <label className="fl fl-ico"><Icon name="bulb" size={13} /> 배운 것</label>
            <textarea className="fta" rows={2}
              placeholder="이 상황에서 무엇을 배웠나요?"
              value={form.learned} onChange={e => set('learned', e.target.value)} />
          </div>

          {/* 다음에 */}
          <div className="fg">
            <label className="fl fl-ico"><Icon name="check" size={13} /> 다음에는</label>
            <textarea className="fta" rows={2}
              placeholder="다음에는 어떻게 할 건가요? 구체적인 행동으로"
              value={form.next_action} onChange={e => set('next_action', e.target.value)} />
          </div>

          {/* 태그 */}
          <div className="fg">
            <label className="fl">태그</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {REFLECTION_TAGS.map(tag => (
                <label key={tag.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
                  border: '1.5px solid',
                  borderColor: form.tags.includes(tag.id) ? '#111111' : '#E3E3E3',
                  background: form.tags.includes(tag.id) ? '#F0F0F0' : '#F6F6F6',
                  transition: 'all .15s',
                }}>
                  <input type="checkbox" checked={form.tags.includes(tag.id)}
                    onChange={() => toggleTag(tag.id)}
                    style={{ accentColor: '#111111', width: 14, height: 14, flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: form.tags.includes(tag.id) ? '#111111' : '#111111' }}>
                      #{tag.id}
                    </span>
                    <span style={{ fontSize: 11, color: '#8A8A8A', marginLeft: 8 }}>{tag.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mft">
          {isEdit && (
            <button className="btn" style={{ marginRight: 'auto', color: '#E24B4A', borderColor: '#F09595' }}
              onClick={del}>삭제</button>
          )}
          <button className="btn" onClick={onClose}>취소</button>
          <button className="btn btn-p"
            onClick={save}>저장</button>
        </div>
      </div>
    </div>
  );
}
