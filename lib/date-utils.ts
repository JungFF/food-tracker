import { translations } from './translations';
import type { Locale } from './types';

const WEEKDAY_KEYS = [
  'weekday.sun',
  'weekday.mon',
  'weekday.tue',
  'weekday.wed',
  'weekday.thu',
  'weekday.fri',
  'weekday.sat',
] as const;

export function getDayNumber(date?: Date): number {
  const d = date ?? new Date();
  const jsDay = d.getDay();
  return jsDay === 0 ? 7 : jsDay;
}

function weekdayIndex(day: number): number {
  return day % 7;
}

export function getDayLabel(day: number, locale: Locale = 'zh'): string {
  return `Day ${day} · ${translations[WEEKDAY_KEYS[weekdayIndex(day)]][locale]}`;
}

export function getWeekdayName(day: number, locale: Locale = 'zh'): string {
  return translations[WEEKDAY_KEYS[weekdayIndex(day)]][locale];
}
