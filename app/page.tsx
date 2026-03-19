import HomepageClient from '@/components/HomepageClient';
import { getMealPlan } from '@/lib/data';

export default function HomePage() {
  const mealPlanZh = getMealPlan('zh');
  const mealPlanEn = getMealPlan('en');
  return (
    <main className="mx-auto max-w-[960px] px-4 pb-20">
      <HomepageClient mealPlanZh={mealPlanZh} mealPlanEn={mealPlanEn} />
    </main>
  );
}
