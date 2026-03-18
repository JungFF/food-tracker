import type { ShoppingItem } from '@/lib/types';

interface ShoppingItemRowProps {
  item: ShoppingItem;
  checked: boolean;
  onToggle: (id: string) => void;
}

export default function ShoppingItemRow({ item, checked, onToggle }: ShoppingItemRowProps) {
  return (
    <label
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
        checked ? 'bg-border/40' : ''
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(item.id)}
        className="w-5 h-5 min-w-[44px] min-h-[44px] accent-primary cursor-pointer flex-shrink-0
          appearance-none grid place-content-center
          before:content-[''] before:w-5 before:h-5 before:rounded before:border-2
          before:border-text-muted before:transition-colors
          checked:before:bg-primary checked:before:border-primary"
        style={{ width: 44, height: 44 }}
      />
      <span className={`flex-1 min-w-0 ${checked ? 'line-through text-text-muted' : 'text-text'}`}>
        <span className="block">{item.name}</span>
        {item.note && <span className="block text-xs text-text-muted mt-0.5">{item.note}</span>}
      </span>
      <span
        className={`text-right font-bold whitespace-nowrap ${
          checked ? 'line-through text-text-muted' : 'text-text-secondary'
        }`}
      >
        {item.displayAmount}
      </span>
    </label>
  );
}
