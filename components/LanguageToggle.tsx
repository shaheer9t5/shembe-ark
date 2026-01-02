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

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm cursor-pointer text-gray-600 hover:text-gray-900 transition-colors duration-200 rounded-lg hover:bg-gray-50"
      aria-label={`Switch to ${language === 'en' ? 'isiZulu' : 'English'}`}
    >
      {/* Globe Icon */}
      <svg
        className="w-3 h-3 sm:w-4 sm:h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      
      {/* Current Language Code */}
      <span className="font-medium uppercase">{language}</span>
    </button>
  );
}