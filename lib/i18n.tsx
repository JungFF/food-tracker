'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { translations, type TranslationKey } from './translations';
import type { Locale } from './types';

interface LanguageContextValue {
  locale: Locale;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'zh',
  toggleLocale: () => {},
});

function getInitialLocale(): Locale {
  if (typeof document === 'undefined') return 'zh';
  return document.documentElement.getAttribute('data-locale') === 'en' ? 'en' : 'zh';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  const toggleLocale = useCallback(() => {
    setLocale((prev) => {
      const next = prev === 'zh' ? 'en' : 'zh';
      try {
        localStorage.setItem('locale', next);
      } catch {}
      document.documentElement.setAttribute('data-locale', next);
      document.documentElement.lang = next === 'en' ? 'en' : 'zh-CN';
      return next;
    });
  }, []);

  useEffect(() => {
    document.title = translations['meta.title'][locale];
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, toggleLocale }}>{children}</LanguageContext.Provider>
  );
}

export function useLocale(): Locale {
  return useContext(LanguageContext).locale;
}

export function useToggleLocale(): () => void {
  return useContext(LanguageContext).toggleLocale;
}

export function useT(): (key: TranslationKey) => string {
  const { locale } = useContext(LanguageContext);
  return useCallback((key: TranslationKey) => translations[key][locale], [locale]);
}
