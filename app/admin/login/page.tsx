'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Hardcoded credentials
    if (username === 'shembeark' && password === 'ShembeArk@2026!') {
      // Store auth in sessionStorage
      sessionStorage.setItem('adminAuth', 'true');
      router.push('/admin');
    } else {
      setError(t('admin.login.invalidCredentials'));
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="https://shembeark.co.za" className="inline-block">
            <Image
              src="/shembe-ark.svg"
              alt="Shembe Ark"
              width={320}
              height={32}
              priority
              className="h-auto w-full max-w-[280px] mx-auto cursor-pointer"
            />
          </Link>
        </div>

        {/* Login Form */}
        <div className="bg-white border-2 border-black rounded-lg p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-black mb-2 text-center">{t('admin.login.title')}</h1>
          <p className="text-sm text-black text-center mb-6">{t('admin.login.subtitle')}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-300 rounded p-3">
                <p className="text-red-900 text-sm">{error}</p>
              </div>
            )}

            <div>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-black focus:outline-none focus:ring-1 focus:ring-black bg-white dark:text-black"
                placeholder={t('admin.login.username')}
                required
              />
            </div>

            <div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-black focus:outline-none focus:ring-1 focus:ring-black bg-white dark:text-black"
                placeholder={t('admin.login.password')}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white font-medium py-3 px-6 rounded-lg transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
            >
              {t('admin.login.loginButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

