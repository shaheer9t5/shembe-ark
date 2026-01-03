'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useState, useEffect, useRef } from 'react';

export default function DownloadPage() {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Pause and reset video when modal closes
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Auto-play video when it's ready
  const handleCanPlay = () => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        // Autoplay may be blocked by browser, that's okay
        console.log('Autoplay prevented:', error);
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="flex min-h-screen">
        {/* Desktop Layout: Left Banner with Logo Overlay */}
        <div className="hidden lg:block lg:w-[55vw] lg:min-h-screen relative">
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
        <div className="w-full lg:w-[45vw] flex items-center justify-center p-4 sm:p-6 lg:p-12">
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
              <p className="text-xs sm:text-sm text-black">
                {t('download.subtitle', { appName: 'Datafree Connect' })}
              </p>
              {/* Tutorial Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors underline cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('download.tutorialButton')}
              </button>
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

                <a 
                  href="/apk/Datafree-Connect_2.3.3_apkcombo.com.xapk"
                  download
                  className="w-full bg-black text-white font-medium py-3.5 px-5 rounded-lg text-xs sm:text-sm transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer inline-block text-center"
                >
                  {t('download.android.downloadButton')}
                </a>
                
                {/* Google Play Alternative */}
                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500 mb-2">{t('download.android.googlePlayText')}</p>
                  <a
                    href="https://play.google.com/store/apps/details?id=ee.datafree.connect"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center text-xs text-gray-600 hover:text-gray-900 underline transition-colors"
                  >
                    {t('download.android.googlePlayButton')}
                  </a>
                </div>
              </div>
            </div>

            {/* iPhone Section */}
            <div className='relative mt-12'>
              <Image
                  src="/apple.svg"
                  alt="Apple"
                  width={48}
                  height={48}
                  className="absolute -top-[35px] left-[10px]"
                />
              <div className="mb-8 border-2 border-dashed border-gray-300 rounded-lg p-5 sm:p-6 relative overflow-hidden bg-white">
                <h2 className="text-base sm:text-lg font-bold text-black mb-5">{t('download.ios.title')}</h2>
                {/* Warning Message */}
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
            </div>

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

      {/* Tutorial Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/10 p-4"
          onClick={handleCloseModal}
        >
          <div 
            className="relative bg-white rounded-lg max-w-4xl w-full h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-black">{t('download.tutorialTitle')}</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-black transition-colors cursor-pointer"
                aria-label={t('download.closeModal')}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Video Container */}
            <div className="relative bg-black flex-1 flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                src="/f9b068d8-1a9e-4b20-9e45-011dc0c584d4.MP4"
                controls
                autoPlay
                playsInline
                preload="auto"
                className="w-full h-full object-contain"
                onCanPlay={handleCanPlay}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
