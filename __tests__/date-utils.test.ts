import { describe, it, expect, vi, afterEach } from 'vitest';

import { getDayNumber, getDayLabel, getWeekdayName } from '@/lib/date-utils';

describe('getDayNumber', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns 1 for Monday', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 16));
    expect(getDayNumber()).toBe(1);
    vi.useRealTimers();
  });

  it('returns 7 for Sunday', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 22));
    expect(getDayNumber()).toBe(7);
    vi.useRealTimers();
  });

  it('returns correct day for a specific date argument', () => {
    expect(getDayNumber(new Date(2026, 2, 18))).toBe(3);
  });
});

describe('getDayLabel', () => {
  it('returns "Day 1 · 周一" for zh', () => {
    expect(getDayLabel(1, 'zh')).toBe('Day 1 · 周一');
  });

  it('returns "Day 1 · Mon" for en', () => {
    expect(getDayLabel(1, 'en')).toBe('Day 1 · Mon');
  });

  it('returns "Day 7 · 周日" for zh', () => {
    expect(getDayLabel(7, 'zh')).toBe('Day 7 · 周日');
  });

  it('returns "Day 7 · Sun" for en', () => {
    expect(getDayLabel(7, 'en')).toBe('Day 7 · Sun');
  });

  it('defaults to zh when no locale provided', () => {
    expect(getDayLabel(1)).toBe('Day 1 · 周一');
  });
});

describe('getWeekdayName', () => {
  it('returns 周一 for day 1 zh', () => {
    expect(getWeekdayName(1, 'zh')).toBe('周一');
  });

  it('returns Mon for day 1 en', () => {
    expect(getWeekdayName(1, 'en')).toBe('Mon');
  });

  it('returns 周日 for day 7 zh', () => {
    expect(getWeekdayName(7, 'zh')).toBe('周日');
  });

  it('returns Sun for day 7 en', () => {
    expect(getWeekdayName(7, 'en')).toBe('Sun');
  });

  it('defaults to zh when no locale provided', () => {
    expect(getWeekdayName(1)).toBe('周一');
  });
});
