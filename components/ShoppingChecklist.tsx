'use client';

import { useCallback, useSyncExternalStore } from 'react';

import { useLocale, useT } from '@/lib/i18n';
import { getCheckedIds, resetChecklist, toggleItem } from '@/lib/shopping-storage';
import type { ShoppingList } from '@/lib/types';

import ShoppingCategory from './ShoppingCategory';

interface ShoppingChecklistProps {
  shoppingListZh: ShoppingList;
  shoppingListEn: ShoppingList;
}

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

export default function ShoppingChecklist({
  shoppingListZh,
  shoppingListEn,
}: ShoppingChecklistProps) {
  const locale = useLocale();
  const t = useT();
  const shoppingList = locale === 'en' ? shoppingListEn : shoppingListZh;

  const categories = [
    { key: 'breakfast' as const, title: t('shopping.cat.breakfast'), icon: '🍳' },
    { key: 'staple' as const, title: t('shopping.cat.staple'), icon: '🍚' },
    { key: 'protein' as const, title: t('shopping.cat.protein'), icon: '🥩' },
    { key: 'vegetable' as const, title: t('shopping.cat.vegetable'), icon: '🥬' },
    { key: 'oil' as const, title: t('shopping.cat.oil'), icon: '🫒' },
    { key: 'pantry' as const, title: t('shopping.cat.pantry'), icon: '🏠' },
  ];

  const checkedIds = useCheckedIds();

  const allItems = categories.flatMap((cat) => shoppingList[cat.key]);
  const totalCount = allItems.length;

  const handleToggle = useCallback((id: string) => {
    toggleItem(id);
    refreshSnapshot();
  }, []);

  const handleReset = useCallback(() => {
    if (window.confirm(t('shopping.confirm_reset'))) {
      resetChecklist();
      refreshSnapshot();
    }
  }, [t]);

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

  const progressText = t('shopping.progress')
    .replace('{checked}', String(checkedCount))
    .replace('{total}', String(totalCount));

  return (
    <div className="pt-6 px-4">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-bg-gradient-start to-bg-gradient-end p-4 mb-4">
        <h1 className="text-xl font-bold text-text mb-3">{t('shopping.title')}</h1>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">{progressText}</span>
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
            {t('shopping.reset')}
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
            checkedSet={checkedSet}
            onToggle={handleToggle}
          />
        );
      })}
    </div>
  );
}
