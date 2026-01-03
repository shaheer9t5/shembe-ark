'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function DownloadPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="flex min-h-screen">
        {/* Desktop Layout: Left Banner with Logo Overlay */}
        <div className="hidden lg:block lg:w-[55vw] lg:h-screen lg:fixed lg:left-0 lg:top-0 relative overflow-hidden">
          <Image
            src="/shembe-banner.png"
            alt="Shembe Banner"
            fill
            className="object-cover"
            priority
          />
          {/* White Logo Overlay - Centered on Banner */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Link href="https://shembeark.co.za/" rel="noopener noreferrer">
              <Image
                src="/shembe-ark-white.svg"
                alt="Shembe Ark"
                width={320}
                height={32}
                priority
                className="h-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>
        </div>

        {/* Right Side: Download Instructions */}
        <div className="w-full lg:w-[45vw] lg:ml-[55vw] flex items-center justify-center p-4 sm:p-6 lg:p-12">
          <div className="w-full max-w-lg">
            {/* Mobile Header - Only show on mobile */}
            <div className="text-center mb-6 sm:mb-8 lg:hidden">
              <div className="flex justify-center mb-4 sm:mb-6">
                <Link href="https://shembeark.co.za/" rel="noopener noreferrer">
                  <Image
                    src="/shembe-ark.svg"
                    alt="Shembe Ark"
                    width={320}
                    height={32}
                    priority
                    className="h-auto w-full max-w-[280px] sm:max-w-[320px] cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </Link>
              </div>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-xl sm:text-2xl font-bold text-black mb-3">{t('download.title')}</h1>
              <p className="text-xs sm:text-sm text-black mb-4">
                {t('download.intro')}
              </p>
            </div>

            {/* Android Section */}
            <div className="relative mt-12">
              <Image
                src="/android.svg"
                alt="Android"
                width={48}
                height={48}
                className="absolute -top-[25px] left-[10px]"
              />            
              <div className="mb-8 border-2 border-dashed border-gray-300 rounded-lg p-5 sm:p-6 relative overflow-hidden">
                <h2 className="text-base sm:text-lg font-bold text-black mb-5">{t('download.android.title')}</h2>
                <p className="text-xs sm:text-sm text-black mb-4 font-medium">
                  {t('download.android.whenYouReceiveSMS')}
                </p>
                <div className="space-y-3 mb-5">
                  <div className="flex items-start">
                    <span className="text-black font-medium text-sm mr-2.5 mt-0.5 min-w-[18px]">1.</span>
                    <p className="text-black text-xs sm:text-sm flex-1">{t('download.android.steps.step1')}</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-black font-medium text-sm mr-2.5 mt-0.5 min-w-[18px]">2.</span>
                    <p className="text-black text-xs sm:text-sm flex-1">{t('download.android.steps.step2')}</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-black font-medium text-sm mr-2.5 mt-0.5 min-w-[18px]">3.</span>
                    <p className="text-black text-xs sm:text-sm flex-1">{t('download.android.steps.step3')}</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-black font-medium text-sm mr-2.5 mt-0.5 min-w-[18px]">4.</span>
                    <p className="text-black text-xs sm:text-sm flex-1">{t('download.android.steps.step4')}</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-black mb-5">
                  {t('download.android.setupComplete')}
                </p>
                <Image
                    src="/google-play.png"
                    alt="Google Play"
                    width={150}
                    height={80}
                    className="h-auto w-auto cursor-pointer mx-auto mb-2"
                    onClick={() => {
                      window.open('https://play.google.com/store/apps/details?id=ee.datafree.connect', '_blank');
                    }}
                  />
                <p className="mt-5 text-xs text-gray-500 text-center">
                  {t('download.android.importantNote')}
                </p>
              </div>
            </div>

            {/* iPhone Section */}
            {/* <div className='relative mt-12'>
              <Image
                  src="/apple.svg"
                  alt="Apple"
                  width={48}
                  height={48}
                  className="absolute -top-[35px] left-[10px]"
                />
              <div className="mb-8 border-2 border-dashed border-gray-300 rounded-lg p-5 sm:p-6 relative overflow-hidden bg-white">
                <h2 className="text-base sm:text-lg font-bold text-black mb-5">{t('download.ios.title')}</h2>
                <div className="bg-amber-50 border border-amber-300 rounded p-2.5 mb-5 flex items-start">
                  <svg className="w-4 h-4 text-amber-600 mr-2 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-amber-900 text-xs">{t('download.ios.warning')}</p>
                </div>

                <button className="w-full bg-black text-white font-medium py-2.5 px-5 rounded-lg text-xs sm:text-sm transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black flex items-center justify-center gap-2 cursor-pointer">
                  <Image
                    src="/apple-white.svg"
                    alt="Download on the App Store"
                    width={90}
                    height={30}
                    className="h-5 w-auto"
                  />
                  <Image
                    src="/appstore-text.svg"
                    alt="Download on the App Store"
                    width={90}
                    height={50}
                    className="h-7 w-auto"
                  />
                </button>
              </div>
            </div> */}

            {/* Back Button */}
            <div className="mt-6 pt-5 border-gray-300">
              <Link 
                href="/"
                className="flex justify-center items-center text-black hover:text-gray-700 transition-colors text-xs"
              >
                <div className="w-6 h-6 rounded-full border border-black flex items-center justify-center mr-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </div>
                <span className="font-semibold text-sm">{t('download.backButton')}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
