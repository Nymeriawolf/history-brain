'use client';

import { Globe } from 'lucide-react';
import { useLanguageSwitch } from '@/i18n/useLanguageSwitch';

export function LanguageSwitcher() {
  const { locale, switchLocale } = useLanguageSwitch();

  return (
    <button
      onClick={() => switchLocale(locale === 'en' ? 'zh' : 'en')}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-600 transition-colors"
    >
      <Globe className="h-5 w-5" />
      <span className="text-sm font-medium">
        {locale === 'en' ? '中文' : 'EN'}
      </span>
    </button>
  );
}
