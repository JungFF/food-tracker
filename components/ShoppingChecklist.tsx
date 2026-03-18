'use client';

import { useCallback, useSyncExternalStore } from 'react';

import { getCheckedIds, resetChecklist, toggleItem } from '@/lib/shopping-storage';
import type { ShoppingList } from '@/lib/types';

import ShoppingCategory from './ShoppingCategory';

interface ShoppingChecklistProps {
  shoppingList: ShoppingList;
}

const categories = [
  { key: 'breakfast' as const, title: '早餐', icon: '🍳' },
  { key: 'staple' as const, title: '主食', icon: '🍚' },
  { key: 'protein' as const, title: '蛋白质', icon: '🥩' },
  { key: 'vegetable' as const, title: '蔬菜', icon: '🥬' },
  { key: 'oil' as const, title: '食用油', icon: '🫒' },
  { key: 'pantry' as const, title: '家中常备', icon: '🏠' },
];

// External store for checked IDs backed by localStorage
const listeners = new Set<() => void>();
let cachedSnapshot: string[] = [];

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function refreshSnapshot() {
  cachedSnapshot = getCheckedIds();
  listeners.forEach((cb) => cb());
}

function getSnapshot(): string[] {
  return cachedSnapshot;
}

function getServerSnapshot(): null {
  return null;
}

function useCheckedIds() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Initialize snapshot on module load (client only)
if (typeof window !== 'undefined') {
  cachedSnapshot = getCheckedIds();
}

export default function ShoppingChecklist({ shoppingList }: ShoppingChecklistProps) {
  const checkedIds = useCheckedIds();

  const allItems = categories.flatMap((cat) => shoppingList[cat.key]);
  const totalCount = allItems.length;

  const handleToggle = useCallback((id: string) => {
    toggleItem(id);
    refreshSnapshot();
  }, []);

  const handleReset = useCallback(() => {
    if (window.confirm('确定要清除所有勾选记录吗？')) {
      resetChecklist();
      refreshSnapshot();
    }
  }, []);

  // Skeleton while loading (server snapshot is null)
  if (checkedIds === null) {
    return (
      <div className="animate-pulse px-4 pt-6">
        <div className="h-10 rounded-lg bg-primary-light/20 mb-4" />
        <div className="h-4 w-32 rounded bg-primary-light/20 mb-3" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="mb-4">
            <div className="h-4 w-24 rounded bg-primary-light/10 mb-2" />
            <div className="h-14 rounded-xl bg-white/50 mb-1" />
            <div className="h-14 rounded-xl bg-white/50 mb-1" />
          </div>
        ))}
      </div>
    );
  }

  const checkedSet = new Set(checkedIds);
  const checkedCount = allItems.filter((item) => checkedSet.has(item.id)).length;
  const percentage = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  return (
    <div className="pt-6 px-4">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-bg-gradient-start to-bg-gradient-end p-4 mb-4">
        <h1 className="text-xl font-bold text-text mb-3">🛒 一周采购清单</h1>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">
            已买 {checkedCount} / 共 {totalCount} 项
          </span>
          <span className="text-sm font-semibold text-primary">{percentage}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleReset}
            className="text-sm text-primary font-medium px-3 py-1.5 rounded-lg
              border border-primary/30 hover:bg-primary/10 transition-colors
              min-h-[44px] min-w-[44px]"
          >
            重置清单
          </button>
        </div>
      </div>

      {/* Categories */}
      {categories.map((cat) => {
        const items = shoppingList[cat.key];
        if (items.length === 0) return null;
        return (
          <ShoppingCategory
            key={cat.key}
            title={cat.title}
            icon={cat.icon}
            items={items}
            checkedIds={checkedIds}
            onToggle={handleToggle}
          />
        );
      })}
    </div>
  );
}
