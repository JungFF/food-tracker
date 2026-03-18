'use client';

import { useEffect } from 'react';

import { installWKWebViewScrollFix } from '@/lib/wkwebview-scroll-fix';

export default function WKWebViewScrollFix() {
  useEffect(() => {
    installWKWebViewScrollFix();
  }, []);

  return null;
}
