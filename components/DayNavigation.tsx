'use client';

import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const locale = useLocale();
  const t = useT();

  const todayNum = useMemo(() => getDayNumber(), []);

  const currentPlan = weekPlan.find((d) => d.day === currentDay);

  const navigate = useCallback(
    (day: number) => {
      onDayChange(day);
      router.replace(`/?day=${day}`, { scroll: false });
    },
    [onDayChange, router]
  );

  const goPrev = useCallback(() => {
    navigate(currentDay === 1 ? 7 : currentDay - 1);
  }, [currentDay, navigate]);

  const goNext = useCallback(() => {
    navigate(currentDay === 7 ? 1 : currentDay + 1);
  }, [currentDay, navigate]);

  const goToday = useCallback(() => {
    navigate(todayNum);
  }, [todayNum, navigate]);

  const isShrimp = currentPlan?.dayType === '虾仁日';
  const badgeColors = isShrimp ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-800';
  const badgeLabel = isShrimp ? t('day.shrimp') : t('day.beef');

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
            {currentPlan && (
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badgeColors}`}
              >
                {badgeLabel}
              </span>
            )}
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
