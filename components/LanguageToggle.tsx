'use client';

import { useLocale, useToggleLocale } from '@/lib/i18n';

export default function LanguageToggle() {
  const locale = useLocale();
  const toggleLocale = useToggleLocale();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="fixed top-3 right-3 z-40 flex items-center gap-1 rounded-full border border-border bg-white/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm transition-colors hover:bg-primary-light/20 min-h-[44px] min-w-[44px]"
      style={{ paddingTop: 'max(6px, env(safe-area-inset-top))' }}
      aria-label={locale === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      <span className={locale === 'zh' ? 'text-primary font-bold' : 'text-text-muted'}>中</span>
      <span className="text-text-muted">/</span>
      <span className={locale === 'en' ? 'text-primary font-bold' : 'text-text-muted'}>EN</span>
    </button>
  );
}
