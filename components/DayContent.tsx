'use client';

import { useT } from '@/lib/i18n';
import type { DayPlan, FixedBreakfast, Recipe } from '@/lib/types';

import BreakfastSection from './BreakfastSection';
import CollapsibleSection from './CollapsibleSection';
import WeighingCard from './WeighingCard';

interface DayContentProps {
  dayPlan: DayPlan;
  recipe: Recipe | undefined;
  breakfast: FixedBreakfast;
  mealPrepTips: string[];
  executionReminders: string[];
}

function TipList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="mb-1 font-semibold text-text">{title}</h4>
      <ul className="list-disc space-y-1 pl-5">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function DayContent({
  dayPlan,
  recipe,
  breakfast,
  mealPrepTips,
  executionReminders,
}: DayContentProps) {
  const t = useT();
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-text">{dayPlan.menu}</h2>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <WeighingCard person="you" weighing={dayPlan.you} dayType={dayPlan.dayType} />
        </div>
        <div className="flex-1">
          <WeighingCard person="wife" weighing={dayPlan.wife} dayType={dayPlan.dayType} />
        </div>
      </div>

      {recipe && (
        <CollapsibleSection title={t('section.recipe_steps')} icon="👨‍🍳">
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-text-secondary">
            {recipe.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </CollapsibleSection>
      )}

      <CollapsibleSection title={t('section.prep_reminders')} icon="📋">
        <div className="space-y-3 text-sm text-text-secondary">
          <TipList title={t('section.meal_prep_tips')} items={mealPrepTips} />
          <TipList title={t('section.execution_reminders')} items={executionReminders} />
        </div>
      </CollapsibleSection>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          {t('breakfast.smoothie_title')}
        </h3>
        <BreakfastSection breakfast={breakfast} />
      </div>
    </div>
  );
}
