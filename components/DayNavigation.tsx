'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';

import { getDayLabel, getDayNumber } from '@/lib/date-utils';
import type { DayPlan } from '@/lib/types';

interface DayNavigationProps {
  weekPlan: DayPlan[];
}

function dayTypeBadge(dayType: '虾仁日' | '牛肉日') {
  if (dayType === '虾仁日') {
    return (
      <span className="inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
        🦐 虾仁日
      </span>
    );
  }
  return (
    <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
      🥩 牛肉日
    </span>
  );
}

function getCalendarDate(dayNumber: number): string {
  const today = new Date();
  const todayDayNum = getDayNumber(today);
  const diff = dayNumber - todayDayNum;
  const target = new Date(today);
  target.setDate(today.getDate() + diff);
  return `${target.getMonth() + 1}月${target.getDate()}日`;
}

export default function DayNavigation({ weekPlan }: DayNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const todayNum = useMemo(() => getDayNumber(), []);

  const currentDay = useMemo(() => {
    const paramDay = searchParams.get('day');
    if (paramDay) {
      const n = Number(paramDay);
      if (n >= 1 && n <= 7) return n;
    }
    return todayNum;
  }, [searchParams, todayNum]);

  const currentPlan = weekPlan.find((d) => d.day === currentDay);

  const showDay = useCallback((day: number) => {
    // Toggle visibility of DayContent blocks
    document.querySelectorAll<HTMLElement>('[data-day]').forEach((el) => {
      const elDay = Number(el.getAttribute('data-day'));
      if (elDay === day) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });
  }, []);

  // On mount and day change, show/hide content
  useEffect(() => {
    showDay(currentDay);
  }, [currentDay, showDay]);

  const navigate = useCallback(
    (day: number) => {
      router.replace(`/?day=${day}`, { scroll: false });
    },
    [router]
  );

  const goPrev = useCallback(() => {
    const prev = currentDay === 1 ? 7 : currentDay - 1;
    navigate(prev);
  }, [currentDay, navigate]);

  const goNext = useCallback(() => {
    const next = currentDay === 7 ? 1 : currentDay + 1;
    navigate(next);
  }, [currentDay, navigate]);

  const goToday = useCallback(() => {
    navigate(todayNum);
  }, [todayNum, navigate]);

  return (
    <div className="mb-4 rounded-xl bg-gradient-to-r from-bg-gradient-start to-bg-gradient-end p-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left arrow */}
        <button
          type="button"
          onClick={goPrev}
          className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-text-secondary transition-colors hover:bg-white/60"
          aria-label="前一天"
        >
          ‹
        </button>

        {/* Center info */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-text">{getDayLabel(currentDay)}</span>
            {currentPlan && dayTypeBadge(currentPlan.dayType)}
          </div>
          <button
            type="button"
            onClick={goToday}
            className="text-xs text-text-muted transition-colors hover:text-primary"
            title="跳回今天"
          >
            {getCalendarDate(currentDay)}
            {currentDay === todayNum && ' (今天)'}
          </button>
        </div>

        {/* Right arrow */}
        <button
          type="button"
          onClick={goNext}
          className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-text-secondary transition-colors hover:bg-white/60"
          aria-label="后一天"
        >
          ›
        </button>
      </div>
    </div>
  );
}
