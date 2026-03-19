'use client';

import { useCallback, useMemo } from 'react';

import { getDayLabel, getDayNumber } from '@/lib/date-utils';
import { useLocale, useT } from '@/lib/i18n';
import type { DayPlan } from '@/lib/types';

interface DayNavigationProps {
  weekPlan: DayPlan[];
  currentDay: number;
  onDayChange: (day: number) => void;
}

function getCalendarDate(dayNumber: number, locale: 'zh' | 'en'): string {
  const today = new Date();
  const todayDayNum = getDayNumber(today);
  const diff = dayNumber - todayDayNum;
  const target = new Date(today);
  target.setDate(today.getDate() + diff);
  if (locale === 'en') {
    const month = target.toLocaleString('en-US', { month: 'short' });
    return `${month} ${target.getDate()}`;
  }
  return `${target.getMonth() + 1}月${target.getDate()}日`;
}

export default function DayNavigation({ weekPlan, currentDay, onDayChange }: DayNavigationProps) {
  const locale = useLocale();
  const t = useT();

  const todayNum = useMemo(() => getDayNumber(), []);

  const currentPlan = weekPlan.find((d) => d.day === currentDay);

  const goPrev = useCallback(() => {
    const prev = currentDay === 1 ? 7 : currentDay - 1;
    onDayChange(prev);
  }, [currentDay, onDayChange]);

  const goNext = useCallback(() => {
    const next = currentDay === 7 ? 1 : currentDay + 1;
    onDayChange(next);
  }, [currentDay, onDayChange]);

  const goToday = useCallback(() => {
    onDayChange(todayNum);
  }, [todayNum, onDayChange]);

  const dayTypeBadge = (dayType: '虾仁日' | '牛肉日') => {
    if (dayType === '虾仁日') {
      return (
        <span className="inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
          {t('day.shrimp')}
        </span>
      );
    }
    return (
      <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
        {t('day.beef')}
      </span>
    );
  };

  return (
    <div className="mb-4 rounded-xl bg-gradient-to-r from-bg-gradient-start to-bg-gradient-end p-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left arrow */}
        <button
          type="button"
          onClick={goPrev}
          className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-text-secondary transition-colors hover:bg-white/60"
          aria-label={t('daynav.prev')}
        >
          ‹
        </button>

        {/* Center info */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-text">{getDayLabel(currentDay, locale)}</span>
            {currentPlan && dayTypeBadge(currentPlan.dayType)}
          </div>
          <button
            type="button"
            onClick={goToday}
            className="min-h-[44px] flex items-center text-xs text-text-muted transition-colors hover:text-primary"
            title={t('daynav.jump_today')}
          >
            {getCalendarDate(currentDay, locale)}
            {currentDay === todayNum && ` ${t('daynav.today')}`}
          </button>
        </div>

        {/* Right arrow */}
        <button
          type="button"
          onClick={goNext}
          className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-text-secondary transition-colors hover:bg-white/60"
          aria-label={t('daynav.next')}
        >
          ›
        </button>
      </div>
    </div>
  );
}
