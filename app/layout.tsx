import type { Metadata } from 'next';

import BottomNav from '@/components/BottomNav';
import WKWebViewScrollFix from '@/components/WKWebViewScrollFix';

import './globals.css';

export const metadata: Metadata = {
  title: '夫妻减脂食谱',
  description: '每日食谱称重数据 & 采购清单',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <BottomNav />
        <WKWebViewScrollFix />
      </body>
    </html>
  );
}
