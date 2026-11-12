export const SB_URL = 'https://sfypajzdifrwrdlxbcvy.supabase.co';
export const SB_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmeXBhanpkaWZyd3JkbHhiY3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NTUwOTcsImV4cCI6MjA5MjQzMTA5N30.3okK-nRduGFkCmeljgUggxIo-opoM-46SzDfXr3kSfU';

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
  waiting:    { l: '대기',   c: '#C8C8C8' },
  inprogress: { l: '진행중', c: '#FF7A1A' },
  hold:       { l: '홀드',   c: '#7A7A7A' },
  done:       { l: '완료',   c: '#111111' },
};

export const CAT = {
  pkg:     { l: '패키지',   i: 'package',   b: 'b-pkg' },
  inhouse: { l: '사내 디자인', i: 'palette', b: 'b-vid' },
  posm:    { l: 'POSM',     i: 'signpost',  b: 'b-posm' },
  project: { l: '프로젝트', i: 'folder',    b: 'b-prj' },
  general: { l: '일반',     i: 'clipboard', b: 'b-gen' },
};

export const EVENT_TYPE = {
  meeting: { l: '회의', i: 'users',    bg: '#111111', fg: '#FFFFFF' },
  outside: { l: '외근', i: 'car',      bg: '#ECECEC', fg: '#111111' },
  trip:    { l: '출장', i: 'luggage',  bg: '#FFE6D2', fg: '#B5520C' },
  audit:   { l: '감리', i: 'printer',  bg: '#FF7A1A', fg: '#FFFFFF' },
  shoot:   { l: '촬영', i: 'camera',   bg: '#FFFFFF', fg: '#111111' },
  dinner:  { l: '회식', i: 'utensils', bg: '#DADADA', fg: '#3A3A3A' },
};

export const MT_TYPE = {
  meeting: { l: '회의', i: 'users', c: 'mt-meeting' },
  call:    { l: '통화', i: 'phone', c: 'mt-call' },
  mail:    { l: '메일', i: 'mail',  c: 'mt-mail' },
  memo:    { l: '메모', i: 'bulb',  c: 'mt-memo' },
  etc:     { l: '기타', i: 'pin',   c: 'mt-etc' },
};

export const PKG_LABELS = {
  pkg: '패키지', ballcase: '볼케이스', outer: '외박스(외함)', inner: '내함', can: '캔',
  container: '용기', label: '라벨', sticker: '덧방스티커', etc: '기타',
};

export const POSM_LABELS = {
  wobbler: '와블러', showcard: '쇼카드', poster: '포스터', display: '매대', etc: '기타',
};

export const INHOUSE_LABELS = {
  support: '디자인 지원', doc: '사내 문서', etc: '기타',
};

// 제품군. 건과는 제품마다 볼케이스와 외박스가 필수다.
export const PRODUCT_LINE = { dry: '건과', ice: '빙과' };

// 작업 구성에서 한 번 눌러 추가하는 종류
export const ITEM_SUGGEST = {
  dry: ['버티컬', '삼방', '스탠딩', '볼케이스', '외박스'],
  ice: ['바', '지펜슬', '콘', '튜브', '컵', '홈', '리드지'],
};

export const TYPE_LABELS = { pkg: PKG_LABELS, posm: POSM_LABELS, inhouse: INHOUSE_LABELS };
export const TYPE_FIELD_LABEL = { pkg: '패키지 형태', posm: 'POSM 종류', inhouse: '사내 디자인 종류' };

export const KR_HOLIDAYS = {
  '2025-01-01': '신정', '2025-01-28': '설날', '2025-01-29': '설날', '2025-01-30': '설날',
  '2025-03-01': '삼일절', '2025-05-05': '어린이날', '2025-05-06': '대체공휴일',
  '2025-06-06': '현충일', '2025-08-15': '광복절', '2025-10-03': '개천절',
  '2025-10-05': '추석', '2025-10-06': '추석', '2025-10-07': '추석', '2025-10-08': '대체공휴일',
  '2025-10-09': '한글날', '2025-12-25': '성탄절',
  '2026-01-01': '신정', '2026-02-16': '설날', '2026-02-17': '설날', '2026-02-18': '설날',
  '2026-03-01': '삼일절', '2026-03-02': '대체공휴일', '2026-05-05': '어린이날',
  '2026-05-24': '부처님오신날', '2026-05-25': '대체공휴일', '2026-06-03': '지방선거',
  '2026-06-06': '현충일', '2026-08-15': '광복절', '2026-08-17': '대체공휴일',
  '2026-09-24': '추석', '2026-09-25': '추석', '2026-09-26': '추석',
  '2026-10-03': '개천절', '2026-10-05': '대체공휴일', '2026-10-09': '한글날', '2026-12-25': '성탄절',
  '2027-01-01': '신정', '2027-02-05': '설날', '2027-02-06': '설날', '2027-02-07': '설날',
  '2027-02-08': '대체공휴일', '2027-03-01': '삼일절', '2027-05-05': '어린이날',
  '2027-05-13': '부처님오신날', '2027-06-06': '현충일', '2027-08-15': '광복절',
  '2027-08-16': '대체공휴일', '2027-09-14': '추석', '2027-09-15': '추석', '2027-09-16': '추석',
  '2027-10-03': '개천절', '2027-10-04': '대체공휴일', '2027-10-09': '한글날',
  '2027-10-11': '대체공휴일', '2027-12-25': '성탄절', '2027-12-27': '대체공휴일',
};

// 첫 근무일. 매년 이 날이 입사 기념일이다.
export const JOIN_DATE = '2026-10-19';

export const REFLECTION_PASSWORD = '2233';

export const MOODS = [
  { id: 'reflect', icon: 'frown',   label: '반성' },
  { id: 'learn',   icon: 'bulb',    label: '배움' },
  { id: 'observe', icon: 'eye',     label: '관찰' },
  { id: 'grow',    icon: 'sprout',  label: '성장' },
  { id: 'comm',    icon: 'message', label: '소통' },
];

export const REFLECTION_TAGS = [
  { id: '소통',     desc: '말하기, 듣기, 피드백 주고받기' },
  { id: '태도',     desc: '마음가짐, 자세, 반응 방식' },
  { id: '업무방식', desc: '일하는 방법, 효율, 프로세스' },
  { id: '시간관리', desc: '우선순위, 마감, 집중력' },
  { id: '리더십',   desc: '팀워크, 관계, 이끄는 방식' },
  { id: '디자인',   desc: '디자인 작업, 감각, 피드백' },
  { id: '관계',     desc: '팀원, 팀장, 사람과의 관계' },
];
