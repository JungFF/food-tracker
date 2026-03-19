import { describe, it, expect } from 'vitest';

import { translations, type TranslationKey } from '@/lib/translations';

describe('translations', () => {
  it('every key has both zh and en values', () => {
    for (const [_key, val] of Object.entries(translations)) {
      expect(val).toHaveProperty('zh');
      expect(val).toHaveProperty('en');
      expect(typeof val.zh).toBe('string');
      expect(typeof val.en).toBe('string');
      expect(val.zh.length).toBeGreaterThan(0);
      expect(val.en.length).toBeGreaterThan(0);
    }
  });

  it('nav.today has correct values', () => {
    expect(translations['nav.today']).toEqual({ zh: '今日', en: 'Today' });
  });

  it('TranslationKey type is usable', () => {
    const _key: TranslationKey = 'nav.today';
    expect(_key).toBe('nav.today');
  });
});
