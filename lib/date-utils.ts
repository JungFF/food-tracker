// lib/date-utils.ts
const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export function getDayNumber(date?: Date): number {
  const d = date ?? new Date();
  const jsDay = d.getUTCDay();
  return jsDay === 0 ? 7 : jsDay;
}

export function getDayLabel(day: number): string {
  const weekdayIndex = day === 7 ? 0 : day;
  return `Day ${day} · ${WEEKDAY_NAMES[weekdayIndex]}`;
}

export function getWeekdayName(day: number): string {
  const weekdayIndex = day === 7 ? 0 : day;
  return WEEKDAY_NAMES[weekdayIndex];
}
