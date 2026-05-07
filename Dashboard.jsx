export const SB_URL = 'https://sfypajzdifrwrdlxbcvy.supabase.co';
export const SB_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmeXBhanpkaWZyd3JkbHhiY3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NTUwOTcsImV4cCI6MjA5MjQzMTA5N30.3okK-nRduGFkCmeljgUggxIo-opoM-46SzDfXr3kSfU';

export const PASSWORD = '1234';

export const PKG_STEPS = [
  '요청 접수 및 내용 파악',
  '디자인 작업 시작',
  '가안 전달',
  '가안 확정 (베리에이션/수정)',
  '표시사항 수령 및 레이아웃 반영',
  '최종 정보 기입',
  '인쇄용 최종 데이터 수정',
  '품질팀 이관',
  '구매팀 → 인쇄업체 전달',
  '동판 파일 수신 및 검토',
  '별색·중복인쇄 확인 및 지정',
  '감리 일정 확인',
  '감리 참여 및 색상 조정',
  '최종 완료',
];

export const VID_STEPS = [
  '요청 접수 및 내용 파악',
  '시나리오 기획',
  'AI 영상 생성',
  '1차 편집',
  '가안 전달 및 확인',
  '자막 작업',
  '나레이션 수급',
  '음악 편집',
  '최종안 완성',
  '최종 완료',
];

export const STATUS = {
  waiting:    { l: '대기',   c: '#B4B2A9' },
  inprogress: { l: '진행중', c: '#378ADD' },
  hold:       { l: '홀드',   c: '#EF9F27' },
  done:       { l: '완료',   c: '#639922' },
};

export const CAT = {
  pkg:     { l: '패키지',   i: '📦', b: 'b-pkg' },
  video:   { l: '영상',     i: '🎬', b: 'b-vid' },
  project: { l: '프로젝트', i: '🗂', b: 'b-prj' },
  general: { l: '일반',     i: '📋', b: 'b-gen' },
};

export const MT_TYPE = {
  meeting: { l: '🤝 회의', c: 'mt-meeting' },
  call:    { l: '📞 통화', c: 'mt-call' },
  mail:    { l: '📧 메일', c: 'mt-mail' },
  memo:    { l: '💡 메모', c: 'mt-memo' },
  etc:     { l: '📌 기타', c: 'mt-etc' },
};

export const PKG_LABELS = {
  pkg: '패키지', outer: '외함', inner: '내함', can: '캔',
  container: '용기', label: '라벨', sticker: '덧방스티커', etc: '기타',
};

export const KR_HOLIDAYS = {
  '2025-01-01': '신정', '2025-01-28': '설날', '2025-01-29': '설날', '2025-01-30': '설날',
  '2025-03-01': '삼일절', '2025-05-05': '어린이날', '2025-05-06': '대체공휴일',
  '2025-06-06': '현충일', '2025-08-15': '광복절', '2025-10-03': '개천절',
  '2025-10-05': '추석', '2025-10-06': '추석', '2025-10-07': '추석', '2025-10-08': '대체공휴일',
  '2025-10-09': '한글날', '2025-12-25': '성탄절',
  '2026-01-01': '신정', '2026-01-28': '설날', '2026-01-29': '설날', '2026-01-30': '설날',
  '2026-03-01': '삼일절', '2026-05-05': '어린이날', '2026-05-25': '부처님오신날',
  '2026-06-06': '현충일', '2026-08-15': '광복절', '2026-09-24': '추석',
  '2026-09-25': '추석', '2026-09-26': '추석',
  '2026-10-03': '개천절', '2026-10-09': '한글날', '2026-12-25': '성탄절',
};
