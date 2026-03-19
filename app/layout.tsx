import type { Metadata } from 'next';

import BottomNav from '@/components/BottomNav';
import Providers from '@/components/Providers';
import WKWebViewScrollFix from '@/components/WKWebViewScrollFix';

import './globals.css';

export const metadata: Metadata = {
  title: '夫妻减脂食谱',
  description: '每日食谱称重数据 & 采购清单',
};

// This is a hardcoded constant (not user input), safe from XSS
const LOCALE_SCRIPT = `try{var l=localStorage.getItem('locale');if(l==='en'){document.documentElement.setAttribute('data-locale','en');document.documentElement.lang='en';}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        {}
        <script dangerouslySetInnerHTML={{ __html: LOCALE_SCRIPT }} />
      </head>
      <body>
        <Providers>
          {children}
          <BottomNav />
        </Providers>
        <WKWebViewScrollFix />
      </body>
    </html>
  );
}
