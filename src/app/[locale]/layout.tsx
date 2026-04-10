import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {locales} from '@/i18n/request';
import './globals.css';
import Link from 'next/link';
import { BookOpen, Network, Settings, Globe } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-amber-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href={`/${locale}`} className="flex items-center gap-2">
                  <BookOpen className="h-8 w-8 text-amber-600" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {messages.site?.title as string}
                  </span>
                </Link>
              </div>
              <div className="flex items-center gap-6">
                <Link
                  href={`/${locale}`}
                  className="flex items-center gap-2 text-gray-600 hover:text-amber-600 dark:text-gray-300 dark:hover:text-amber-400 transition-colors"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>{messages.nav?.books as string}</span>
                </Link>
                <Link
                  href={`/${locale}/network`}
                  className="flex items-center gap-2 text-gray-600 hover:text-amber-600 dark:text-gray-300 dark:hover:text-amber-400 transition-colors"
                >
                  <Network className="h-5 w-5" />
                  <span>{messages.nav?.network as string}</span>
                </Link>
                <Link
                  href={`/${locale}/settings`}
                  className="flex items-center gap-2 text-gray-600 hover:text-amber-600 dark:text-gray-300 dark:hover:text-amber-400 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                  <span>{messages.nav?.settings as string}</span>
                </Link>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </nav>
        <NextIntlClientProvider messages={messages}>
          <main className="flex-1">{children}</main>
        </NextIntlClientProvider>
        <footer className="bg-white/60 dark:bg-gray-900/60 border-t border-amber-200 dark:border-gray-700 py-4">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
            {messages.site?.description as string}
          </div>
        </footer>
      </body>
    </html>
  );
}
