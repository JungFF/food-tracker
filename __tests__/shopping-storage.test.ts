// __tests__/shopping-storage.test.ts
import { describe, it, expect, beforeEach } from 'vitest';

import { getCheckedIds, toggleItem, resetChecklist, STORAGE_KEY } from '@/lib/shopping-storage';

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

  it('uses v2 storage key', () => {
    expect(STORAGE_KEY).toContain('v2');
  });

  it('old v1 data is not loaded after version bump', () => {
    localStorage.setItem('shopping-checklist:v1:default', JSON.stringify(['breakfast:baozi']));
    expect(getCheckedIds()).toEqual([]);
  });
});
