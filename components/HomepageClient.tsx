'use client';

import { Suspense } from 'react';

import type { DayPlan } from '@/lib/types';

import DayNavigation from './DayNavigation';

function HomepageInner({ weekPlan }: { weekPlan: DayPlan[] }) {
  return <DayNavigation weekPlan={weekPlan} />;
}

export default function HomepageClient({ weekPlan }: { weekPlan: DayPlan[] }) {
  return (
    <Suspense fallback={<HomepageSkeleton />}>
      <HomepageInner weekPlan={weekPlan} />
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
