'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';

import { getDayNumber } from '@/lib/date-utils';
import { useLocale } from '@/lib/i18n';
import type { MealPlan } from '@/lib/types';

import DayContent from './DayContent';
import DayNavigation from './DayNavigation';

interface HomepageClientProps {
  mealPlanZh: MealPlan;
  mealPlanEn: MealPlan;
}

function HomepageInner({ mealPlanZh, mealPlanEn }: HomepageClientProps) {
  const locale = useLocale();
  const searchParams = useSearchParams();

  const todayNum = useMemo(() => getDayNumber(), []);
  const [currentDay, setCurrentDay] = useState(() => {
    const paramDay = searchParams.get('day');
    if (paramDay) {
      const n = Number(paramDay);
      if (n >= 1 && n <= 7) return n;
    }
    return todayNum;
  });

  const mealPlan = locale === 'en' ? mealPlanEn : mealPlanZh;
  const dayPlan = mealPlan.weekPlan.find((d) => d.day === currentDay);
  const recipe = mealPlan.recipes.find((r) => r.day === currentDay);

  return (
    <>
      <DayNavigation
        weekPlan={mealPlan.weekPlan}
        currentDay={currentDay}
        onDayChange={setCurrentDay}
      />
      {dayPlan && (
        <DayContent
          dayPlan={dayPlan}
          recipe={recipe}
          breakfast={mealPlan.fixedBreakfast}
          mealPrepTips={mealPlan.mealPrepTips}
          executionReminders={mealPlan.executionReminders}
        />
      )}
    </>
  );
}

export default function HomepageClient(props: HomepageClientProps) {
  return (
    <Suspense fallback={<HomepageSkeleton />}>
      <HomepageInner {...props} />
    </Suspense>
  );
}

function HomepageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-24 rounded-lg bg-primary-light/20 mb-4" />
      <div className="h-48 rounded-lg bg-primary-light/10" />
    </div>
  );
}
