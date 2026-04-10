import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { BookOpen, Network, Settings } from 'lucide-react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '历史书籍智能研究系统',
  description: 'AI驱动的历史书籍分析与规律提炼系统',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-amber-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center gap-2">
                  <BookOpen className="h-8 w-8 text-amber-600" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    历史大脑
                  </span>
                </Link>
              </div>
              <div className="flex items-center gap-6">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-gray-600 hover:text-amber-600 dark:text-gray-300 dark:hover:text-amber-400 transition-colors"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>书籍管理</span>
                </Link>
                <Link
                  href="/network"
                  className="flex items-center gap-2 text-gray-600 hover:text-amber-600 dark:text-gray-300 dark:hover:text-amber-400 transition-colors"
                >
                  <Network className="h-5 w-5" />
                  <span>关系网络</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 text-gray-600 hover:text-amber-600 dark:text-gray-300 dark:hover:text-amber-400 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                  <span>设置</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
        <footer className="bg-white/60 dark:bg-gray-900/60 border-t border-amber-200 dark:border-gray-700 py-4">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
            历史书籍智能研究系统 - AI驱动的历史规律发现引擎
          </div>
        </footer>
      </body>
    </html>
  );
}
