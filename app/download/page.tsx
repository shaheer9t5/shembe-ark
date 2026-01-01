'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {/* Desktop Layout: Left Banner with Logo Overlay */}
        <div className="hidden lg:block lg:w-[55%] relative">
          <Image
            src="/shembe-banner.png"
            alt="Shembe Banner"
            fill
            className="object-cover"
            priority
          />
          {/* White Logo Overlay - Centered on Banner */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/shembe-ark-white.svg"
              alt="Shembe Ark"
              width={320}
              height={32}
              priority
              className="h-auto"
            />
          </div>
        </div>

        {/* Right Side: Download Instructions */}
        <div className="w-full lg:w-[45%] flex items-center justify-center p-4 sm:p-6 lg:p-12">
          <div className="w-full max-w-lg">
            {/* Mobile Header - Only show on mobile */}
            <div className="text-center mb-6 sm:mb-8 lg:hidden">
              <div className="flex justify-center mb-4 sm:mb-6">
                <Image
                  src="/shembe-ark.svg"
                  alt="Shembe Ark"
                  width={320}
                  height={32}
                  priority
                  className="h-auto w-full max-w-[280px] sm:max-w-[320px]"
                />
              </div>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-xl sm:text-2xl font-bold text-black mb-3">Download myMTN App</h1>
              <p className="text-xs sm:text-sm text-black">
                Choose your platform below to download the <span className="font-semibold">myMTN</span> app and start enjoying complimentary internet access.
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
                <h2 className="text-base sm:text-lg font-bold text-black mb-5">Android Users</h2>
                <div className="space-y-3 mb-5">
                  <div className="flex items-start">
                    <span className="text-black font-medium text-sm mr-2.5 mt-0.5 min-w-[18px]">1.</span>
                    <p className="text-black text-xs sm:text-sm flex-1">Download the myMTN app APK using the button below</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-black font-medium text-sm mr-2.5 mt-0.5 min-w-[18px]">2.</span>
                    <p className="text-black text-xs sm:text-sm flex-1">Enable "Install from Unknown Sources" when prompted</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-black font-medium text-sm mr-2.5 mt-0.5 min-w-[18px]">3.</span>
                    <p className="text-black text-xs sm:text-sm flex-1">Install and launch the myMTN app</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-black font-medium text-sm mr-2.5 mt-0.5 min-w-[18px]">4.</span>
                    <p className="text-black text-xs sm:text-sm flex-1">You will receive an SMS as soon as service is enabled</p>
                  </div>
                </div>

                <button className="w-full bg-black text-white font-medium py-3.5 px-5 rounded-lg text-xs sm:text-sm transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer">
                  Download myMTN for Android
                </button>
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
                <h2 className="text-base sm:text-lg font-bold text-black mb-5">iOS Users</h2>
                {/* Warning Message */}
                <div className="bg-amber-50 border border-amber-300 rounded p-2.5 mb-5 flex items-start">
                  <svg className="w-4 h-4 text-amber-600 mr-2 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-amber-900 text-xs">You will require cellular data to download this app.</p>
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
                <span className="font-semibold text-sm">Register another user</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
