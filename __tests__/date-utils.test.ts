import { describe, it, expect, vi, afterEach } from 'vitest';

import { getDayNumber, getDayLabel, getWeekdayName } from '@/lib/date-utils';

describe('getDayNumber', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns 1 for Monday', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 16)); // Monday (local time)
    expect(getDayNumber()).toBe(1);
    vi.useRealTimers();
  });

  it('returns 7 for Sunday', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 22)); // Sunday (local time)
    expect(getDayNumber()).toBe(7);
    vi.useRealTimers();
  });

  it('returns correct day for a specific date argument', () => {
    expect(getDayNumber(new Date(2026, 2, 18))).toBe(3); // Wednesday (local time)
  });
});

describe('getDayLabel', () => {
  it('returns "Day 1 · 周一" format', () => {
    expect(getDayLabel(1)).toBe('Day 1 · 周一');
  });

  it('returns "Day 7 · 周日" format', () => {
    expect(getDayLabel(7)).toBe('Day 7 · 周日');
  });
});

describe('getWeekdayName', () => {
  it('returns 周一 for day 1', () => {
    expect(getWeekdayName(1)).toBe('周一');
  });

  it('returns 周日 for day 7', () => {
    expect(getWeekdayName(7)).toBe('周日');
  });
});
