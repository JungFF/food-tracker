'use client';

import { useT } from '@/lib/i18n';
import type { PersonWeighing } from '@/lib/types';

interface WeighingCardProps {
  person: 'you' | 'wife';
  weighing: PersonWeighing;
  dayType: '虾仁日' | '牛肉日';
}

export default function WeighingCard({ person, weighing, dayType }: WeighingCardProps) {
  const t = useT();
  const isYou = person === 'you';
  const bgColor = isYou ? 'bg-you' : 'bg-wife';
  const label = isYou ? t('weigh.you') : t('weigh.wife');
  const proteinEmoji = dayType === '虾仁日' ? '🦐' : '🥩';

  return (
    <div className={`${bgColor} rounded-xl p-4 shadow-sm`}>
      <h3 className="mb-3 text-base font-bold text-text">{label}</h3>
      <ul className="space-y-1.5 text-sm text-text-secondary">
        <li>
          {t('weigh.rice')}
          <span className="text-xs text-text-muted">{t('weigh.cooked_weight')}</span>：
          {weighing.rice} g
        </li>
        <li>
          {proteinEmoji} {weighing.protein.name}
          <span className="text-xs text-text-muted">{t('weigh.raw_weight')}</span>：
          {weighing.protein.amount} g
        </li>
        <li>
          {t('weigh.vegetable')}：{weighing.vegetable} g
        </li>
        <li>
          {t('weigh.oil')}：{weighing.oil} g
        </li>
        <li>
          {t('weigh.protein_powder')}：{weighing.powder} g
        </li>
      </ul>
      <p className="mt-3 text-xs text-text-muted">{t('weigh.subtitle')}</p>
    </div>
  );
}
