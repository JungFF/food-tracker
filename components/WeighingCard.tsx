import type { PersonWeighing } from '@/lib/types';

interface WeighingCardProps {
  person: 'you' | 'wife';
  weighing: PersonWeighing;
}

function proteinEmoji(name: string): string {
  if (name.includes('虾')) return '🦐';
  return '🥩';
}

export default function WeighingCard({ person, weighing }: WeighingCardProps) {
  const isYou = person === 'you';
  const bgColor = isYou ? 'bg-you' : 'bg-wife';
  const label = isYou ? '👨 你' : '👩 老婆';

  return (
    <div className={`${bgColor} rounded-xl p-4 shadow-sm`}>
      <h3 className="mb-3 text-base font-bold text-text">{label}</h3>
      <ul className="space-y-1.5 text-sm text-text-secondary">
        <li>
          🍚 糙米<span className="text-xs text-text-muted">（熟重）</span>：{weighing.rice} g
        </li>
        <li>
          {proteinEmoji(weighing.protein.name)} {weighing.protein.name}
          <span className="text-xs text-text-muted">（生重）</span>：{weighing.protein.amount} g
        </li>
        <li>🥬 蔬菜：{weighing.vegetable} g</li>
        <li>🫒 油：{weighing.oil} g</li>
        <li>💪 蛋白粉：{weighing.powder} g</li>
      </ul>
      <p className="mt-3 text-xs text-text-muted">午晚餐总量，各自分锅炒，平分两餐</p>
    </div>
  );
}
