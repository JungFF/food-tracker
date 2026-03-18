import type { ShoppingItem } from '@/lib/types';

import ShoppingItemRow from './ShoppingItemRow';

interface ShoppingCategoryProps {
  title: string;
  icon: string;
  items: ShoppingItem[];
  checkedIds: string[];
  onToggle: (id: string) => void;
}

export default function ShoppingCategory({
  title,
  icon,
  items,
  checkedIds,
  onToggle,
}: ShoppingCategoryProps) {
  return (
    <section className="mb-4">
      <h3 className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
        <span>{icon}</span>
        <span>{title}</span>
      </h3>
      <div className="divide-y divide-border rounded-xl bg-white/70 overflow-hidden">
        {items.map((item) => (
          <ShoppingItemRow
            key={item.id}
            item={item}
            checked={checkedIds.includes(item.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </section>
  );
}
