import React, { useState, useEffect, useCallback } from 'react';
import { MOODS, REFLECTION_TAGS } from '../utils/constants';
import { api } from '../utils/helpers';
import ReflectionLock from '../components/ReflectionLock';
import ReflectionModal from '../components/ReflectionModal';

const SESSION_KEY = 'rf_auth';

export default function Reflection({ showToast }) {
  const [unlocked, setUnlocked] = useState(sessionStorage.getItem(SESSION_KEY) === '1');
  const [entries, setEntries]   = useState([]);
  const [modal, setModal]       = useState(undefined); // undefined=닫힘, null=새글, obj=수정
  const [filterMood, setFilterMood] = useState('all');
  const [filterTag,  setFilterTag]  = useState('all');
  const [search, setSearch]         = useState('');

  const load = useCallback(async () => {
    try {
      const data = await api('reflections?order=entry_date.desc');
      setEntries(data || []);
    } catch (e) { showToast('불러오기 실패: ' + e.message, true); }
  }, [showToast]);

  useEffect(() => {
    if (unlocked) load();
  }, [unlocked, load]);

  function unlock() {
    sessionStorage.setItem(SESSION_KEY, '1');
    setUnlocked(true);
  }

  if (!unlocked) return <ReflectionLock onUnlock={unlock} />;

  // 필터링
  const filtered = entries.filter(e => {
    if (filterMood !== 'all' && e.mood !== filterMood) return false;
    if (filterTag  !== 'all' && !(e.tags || '').split(',').includes(filterTag)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (e.title || '').toLowerCase().includes(q) ||
             (e.situation || '').toLowerCase().includes(q) ||
             (e.learned || '').toLowerCase().includes(q);
    }
    return true;
  });

  // 태그별 카운트
  const tagCounts = {};
  entries.forEach(e => {
    (e.tags || '').split(',').filter(Boolean).forEach(t => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });

  return (
    <div className="page on">
      {/* 헤더 */}
      <div className="ph">
        <div>
          <div className="pt" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Reflection</span>
            <span style={{ fontSize: 13, fontWeight: 400, color: '#9A9590' }}>
              {entries.length}개의 기록
            </span>
          </div>
          <div className="ps">나만의 성장 일지</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input className="fi" placeholder="🔍 검색..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 180, fontSize: 13 }} />
          <button className="btn btn-p" style={{ background: '#6B5FA0', borderColor: 'transparent' }}
            onClick={() => setModal(null)}>
            + 새 기록
          </button>
        </div>
      </div>

      {/* 태그 통계 바 */}
      {entries.length > 0 && (
        <div className="rf-tag-bar">
          {REFLECTION_TAGS.map(tag => (
            tagCounts[tag.id] ? (
              <div key={tag.id} className="rf-tag-stat"
                onClick={() => setFilterTag(filterTag === tag.id ? 'all' : tag.id)}
                style={{ cursor: 'pointer', opacity: filterTag !== 'all' && filterTag !== tag.id ? .4 : 1 }}>
                <span className="rf-tag-name">#{tag.id}</span>
                <span className="rf-tag-cnt">{tagCounts[tag.id]}</span>
              </div>
            ) : null
          ))}
        </div>
      )}

      {/* 필터 칩 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className={'chip' + (filterMood === 'all' ? ' on' : '')}
          style={filterMood === 'all' ? { background: '#6B5FA0', borderColor: 'transparent' } : {}}
          onClick={() => setFilterMood('all')}>전체</button>
        {MOODS.map(m => (
          <button key={m.id}
            className={'chip' + (filterMood === m.id ? ' on' : '')}
            style={filterMood === m.id ? { background: '#6B5FA0', borderColor: 'transparent' } : {}}
            onClick={() => setFilterMood(filterMood === m.id ? 'all' : m.id)}>
            {m.icon} {m.label}
          </button>
        ))}
        {filterTag !== 'all' && (
          <button className="chip on"
            style={{ background: '#6B5FA0', borderColor: 'transparent' }}
            onClick={() => setFilterTag('all')}>
            #{filterTag} ✕
          </button>
        )}
      </div>

      {/* 카드 목록 */}
      {!filtered.length ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#9A9590' }}>
          {entries.length === 0
            ? <><div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div><div style={{ fontSize: 14 }}>첫 번째 기록을 남겨보세요</div><div style={{ fontSize: 12, marginTop: 6 }}>작은 기록이 쌓여서 큰 성장이 돼요</div></>
            : <div style={{ fontSize: 13 }}>검색 결과가 없어요</div>
          }
        </div>
      ) : (
        <div className="rf-grid">
          {filtered.map(e => <ReflectionCard key={e.id} entry={e} onClick={() => setModal(e)} />)}
        </div>
      )}

      {/* 모달 */}
      {modal !== undefined && (
        <ReflectionModal
          entry={modal}
          onClose={() => setModal(undefined)}
          onSaved={async () => { setModal(undefined); await load(); }}
          showToast={showToast}
        />
      )}
    </div>
  );
}

function ReflectionCard({ entry, onClick }) {
  const mood = MOODS.find(m => m.id === entry.mood) || MOODS[0];
  const tags = (entry.tags || '').split(',').filter(Boolean);
  const date = entry.entry_date
    ? entry.entry_date.slice(5).replace('-', '.')
    : '';

  return (
    <div className="rf-card" onClick={onClick}>
      <div className="rf-card-top">
        <span className="rf-mood-badge">{mood.icon} {mood.label}</span>
        <span className="rf-card-date">{date}</span>
      </div>
      <div className="rf-card-title">{entry.title}</div>
      {entry.learned && (
        <div className="rf-card-section">
          <span className="rf-card-label">💡</span>
          <span className="rf-card-text">{entry.learned}</span>
        </div>
      )}
      {entry.next_action && (
        <div className="rf-card-section">
          <span className="rf-card-label">✅</span>
          <span className="rf-card-text">{entry.next_action}</span>
        </div>
      )}
      {tags.length > 0 && (
        <div className="rf-card-tags">
          {tags.map(t => <span key={t} className="rf-tag">#{t}</span>)}
        </div>
      )}
    </div>
  );
}
