'use client';

import type { ReactNode } from 'react';

import { LanguageProvider } from '@/lib/i18n';

import LanguageToggle from './LanguageToggle';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <LanguageToggle />
      {children}
    </LanguageProvider>
  );
}
