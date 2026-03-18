// __tests__/shopping-storage.test.ts
import { describe, it, expect, beforeEach } from 'vitest';

import { getCheckedIds, toggleItem, resetChecklist } from '@/lib/shopping-storage';

describe('shopping-storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty array when nothing is checked', () => {
    expect(getCheckedIds()).toEqual([]);
  });

  it('toggleItem adds an ID', () => {
    toggleItem('breakfast:baozi');
    expect(getCheckedIds()).toEqual(['breakfast:baozi']);
  });

  it('toggleItem removes an already-checked ID', () => {
    toggleItem('breakfast:baozi');
    toggleItem('breakfast:baozi');
    expect(getCheckedIds()).toEqual([]);
  });

  it('resetChecklist clears all checked items', () => {
    toggleItem('breakfast:baozi');
    toggleItem('protein:shrimp');
    resetChecklist();
    expect(getCheckedIds()).toEqual([]);
  });

  it('gracefully handles localStorage being unavailable', () => {
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error('blocked');
    };
    expect(getCheckedIds()).toEqual([]);
    Storage.prototype.getItem = originalGetItem;
  });
});
