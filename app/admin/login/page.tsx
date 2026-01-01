'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Hardcoded credentials
    if (username === 'admin' && password === 'admin123') {
      // Store auth in sessionStorage
      sessionStorage.setItem('adminAuth', 'true');
      router.push('/admin');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/shembe-ark.svg"
            alt="Shembe Ark"
            width={320}
            height={32}
            priority
            className="h-auto w-full max-w-[280px] mx-auto"
          />
        </div>

        {/* Login Form */}
        <div className="bg-white border-2 border-black rounded-lg p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-black mb-2 text-center">Admin Login</h1>
          <p className="text-sm text-black text-center mb-6">Enter your credentials to access the admin panel</p>

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
                className="w-full px-4 py-3 rounded-lg border border-black focus:outline-none focus:ring-1 focus:ring-black bg-white"
                placeholder="Username"
                required
              />
            </div>

            <div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-black focus:outline-none focus:ring-1 focus:ring-black bg-white"
                placeholder="Password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white font-medium py-3 px-6 rounded-lg transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

