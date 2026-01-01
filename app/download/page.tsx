'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-200/30 to-green-200/30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-4xl mx-auto py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Registration Successful!</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose your platform below to download the Temple Free Internet app and start enjoying complimentary internet access.
            </p>
          </div>

          {/* Download Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Android Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="mb-6">
                  <Image
                    src="/google-play.png"
                    alt="Google Play Store"
                    width={200}
                    height={60}
                    className="mx-auto"
                  />
                </div>
                
                <div className="bg-green-500 text-white p-4 rounded-2xl mb-6 inline-block">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4479.9993.9993.0007.5511-.4482.9997-.9993.9997zm-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4479.9993.9993 0 .5511-.4482.9997-.9993.9997zm11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.7033 13.8452 8.1921 12 8.1921s-3.5902.5112-5.1932 1.2652L4.7845 5.9844a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.61 12.2594 1 15.72 1 19.5h22c0-3.78-1.61-7.2406-5.0532-10.1586z"/>
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-4">Android Users</h2>
                
                <div className="space-y-4 text-left mb-8">
                  <div className="flex items-start">
                    <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0">1</div>
                    <p className="text-gray-700">Download the APK file from the SMS link sent to your phone</p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0">2</div>
                    <p className="text-gray-700">Enable "Install from Unknown Sources" if prompted</p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0">3</div>
                    <p className="text-gray-700">Install the APK and launch the app</p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0">4</div>
                    <p className="text-gray-700">Log in with your registered details</p>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  Check for SMS with Download Link
                </button>
              </div>
            </div>

            {/* iOS Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="mb-6">
                  <Image
                    src="/apple-store.png"
                    alt="Apple App Store"
                    width={200}
                    height={60}
                    className="mx-auto"
                  />
                </div>
                
                <div className="bg-blue-500 text-white p-4 rounded-2xl mb-6 inline-block">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-4">iPhone Users</h2>
                
                <div className="space-y-4 text-left mb-8">
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0">1</div>
                    <p className="text-gray-700">Open the App Store on your iPhone</p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0">2</div>
                    <p className="text-gray-700">Search for "Temple Free Internet"</p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0">3</div>
                    <p className="text-gray-700">Download using your cellular data</p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0">4</div>
                    <p className="text-gray-700">Log in with your registered details</p>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  Open App Store
                </button>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-amber-50/90 backdrop-blur-sm rounded-2xl p-8 border border-amber-200/50 shadow-lg mb-8">
            <div className="flex items-center mb-4">
              <div className="bg-amber-500 text-white p-3 rounded-xl mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-amber-800">Important Information</h3>
            </div>
            <div className="text-amber-700 text-lg leading-relaxed">
              <p className="mb-3">
                <strong>Keep your registration details safe!</strong> You'll need them to log into the app and access your free internet service.
              </p>
              <p>
                For support or questions, please contact your temple administrator or visit the temple office during regular hours.
              </p>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <Link 
              href="/"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Register Another User
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
