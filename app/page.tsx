import DayContent from '@/components/DayContent';
import HomepageClient from '@/components/HomepageClient';
import { getMealPlan } from '@/lib/data';

export default function HomePage() {
  const mealPlan = getMealPlan('zh');
  return (
    <main className="mx-auto max-w-[960px] px-4 pb-20">
      <HomepageClient weekPlan={mealPlan.weekPlan} />
      {mealPlan.weekPlan.map((day) => (
        <DayContent
          key={day.day}
          dayPlan={day}
          recipe={mealPlan.recipes.find((r) => r.day === day.day)}
          breakfast={mealPlan.fixedBreakfast}
          mealPrepTips={mealPlan.mealPrepTips}
          executionReminders={mealPlan.executionReminders}
        />
      ))}
    </main>
  );
}
