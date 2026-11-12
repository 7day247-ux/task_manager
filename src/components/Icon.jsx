import React from 'react';
import {
  House, ListChecks, CalendarDays, NotebookPen, Trophy, Images, Sprout, Printer, KeyRound, LogOut,
  Package, Palette, Signpost, FolderKanban, ClipboardList, Users, Car, Luggage, Camera, UtensilsCrossed,
  Phone, Mail, Lightbulb, Pin, Frown, Eye, MessageCircle, Lock, X, Check, TriangleAlert, PartyPopper,
  Search, FileText, User, Palmtree, CircleAlert, CalendarRange, Clock,
} from 'lucide-react';

const MAP = {
  home: House, tasks: ListChecks, calendar: CalendarDays, notes: NotebookPen, trophy: Trophy,
  images: Images, sprout: Sprout, printer: Printer, key: KeyRound, logout: LogOut,
  package: Package, palette: Palette, signpost: Signpost, folder: FolderKanban, clipboard: ClipboardList,
  users: Users, car: Car, luggage: Luggage, camera: Camera, utensils: UtensilsCrossed,
  phone: Phone, mail: Mail, bulb: Lightbulb, pin: Pin, frown: Frown, eye: Eye, message: MessageCircle,
  lock: Lock, x: X, check: Check, alert: TriangleAlert, party: PartyPopper, search: Search,
  file: FileText, user: User, palm: Palmtree, urgent: CircleAlert, week: CalendarRange, clock: Clock,
};

// 앱 전체에서 쓰는 선 아이콘. 글자 색을 그대로 따른다.
export default function Icon({ name, size = 16, stroke = 1.75, className = '', style }) {
  const C = MAP[name];
  if (!C) return null;
  return <C size={size} strokeWidth={stroke} className={'ico ' + className} style={style} aria-hidden="true" />;
}

// 로고: 검은 원 안에 점 두 개
export function Mark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true">
      <circle cx="18" cy="18" r="18" fill="#111111" />
      <circle cx="18" cy="12.5" r="3.2" fill="#FFFFFF" />
      <circle cx="18" cy="23.5" r="3.2" fill="#FF7A1A" />
    </svg>
  );
}
