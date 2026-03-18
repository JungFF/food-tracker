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
  return (
    <div data-day={dayPlan.day} className="hidden space-y-4">
      {/* Menu heading */}
      <h2 className="text-lg font-bold text-text">{dayPlan.menu}</h2>

      {/* Weighing cards */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <WeighingCard person="you" weighing={dayPlan.you} />
        </div>
        <div className="flex-1">
          <WeighingCard person="wife" weighing={dayPlan.wife} />
        </div>
      </div>

      {/* Recipe steps */}
      {recipe && (
        <CollapsibleSection title="做法步骤" icon="👨‍🍳">
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-text-secondary">
            {recipe.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </CollapsibleSection>
      )}

      {/* Meal prep tips & execution reminders */}
      <CollapsibleSection title="备餐与提醒" icon="📋">
        <div className="space-y-3 text-sm text-text-secondary">
          <TipList title="备餐贴士" items={mealPrepTips} />
          <TipList title="执行提醒" items={executionReminders} />
        </div>
      </CollapsibleSection>

      {/* Breakfast */}
      <CollapsibleSection title="早餐" icon="🥣" defaultOpen>
        <BreakfastSection breakfast={breakfast} />
      </CollapsibleSection>
    </div>
  );
}
