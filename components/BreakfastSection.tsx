import type { FixedBreakfast } from '@/lib/types';

import CollapsibleSection from './CollapsibleSection';

interface BreakfastSectionProps {
  breakfast: FixedBreakfast;
}

export default function BreakfastSection({ breakfast }: BreakfastSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {breakfast.smoothie.map((item) => (
          <span
            key={item.name}
            className="inline-block rounded-full bg-primary-light/30 px-3 py-1 text-sm font-medium text-text"
          >
            {item.name} {item.amount}
            {item.unit}
          </span>
        ))}
      </div>
      <CollapsibleSection title="早餐详情" icon="🍳" defaultOpen={false}>
        <div className="space-y-2 text-sm text-text-secondary">
          <p>👨 你：{breakfast.you}</p>
          <p>👩 老婆：{breakfast.wife}</p>
        </div>
      </CollapsibleSection>
    </div>
  );
}
