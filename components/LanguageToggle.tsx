'use client';

import { useLanguage } from '@/context/LanguageContext';

const languages = {
  en: { code: 'en' as const, name: 'English' },
  zu: { code: 'zu' as const, name: 'isiZulu' },
};

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zu' : 'en');
  };

  const currentLang = languages[language];

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
      aria-label={`Switch to ${language === 'en' ? 'isiZulu' : 'English'}`}
      title={`Current: ${currentLang.name} - Click to switch`}
    >
      {/* Globe Icon */}
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m-9 9a9 9 0 019-9"
        />
      </svg>
      
      {/* Current Language Code */}
      <span className="font-medium uppercase">{language}</span>
    </button>
  );
}