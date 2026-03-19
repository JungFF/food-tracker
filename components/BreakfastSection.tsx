'use client';

import { useT } from '@/lib/i18n';
import type { FixedBreakfast } from '@/lib/types';

import CollapsibleSection from './CollapsibleSection';

interface BreakfastSectionProps {
  breakfast: FixedBreakfast;
}

export default function BreakfastSection({ breakfast }: BreakfastSectionProps) {
  const t = useT();
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {breakfast.smoothie.map((item, i) => (
          <span
            key={i}
            className="inline-block rounded-full bg-primary-light/30 px-3 py-1 text-sm font-medium text-text"
          >
            {item.name} {item.amount}
            {item.unit}
          </span>
        ))}
      </div>
      <CollapsibleSection title={t('section.breakfast_details')} icon="🍳" defaultOpen={false}>
        <div className="space-y-2 text-sm text-text-secondary">
          <p>
            {t('breakfast.you')}：{breakfast.you}
          </p>
          <p>
            {t('breakfast.wife')}：{breakfast.wife}
          </p>
        </div>
      </CollapsibleSection>
    </div>
  );
}
