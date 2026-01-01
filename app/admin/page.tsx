'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from '@/types';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem('adminAuth');
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    setAuthenticated(true);
    fetchUsers();
  }, [router]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/register');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      setUsers(data.users || []);
      setError('');
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Simple search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(search) ||
        user.surname.toLowerCase().includes(search) ||
        user.cellphone.includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.address.toLowerCase().includes(search) ||
        user.suburb.toLowerCase().includes(search) ||
        user.temple.toLowerCase().includes(search) ||
        user.province.toLowerCase().includes(search)
      );
    }

    setFilteredUsers(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const headers = ['First Name', 'Surname', 'Cellphone', 'Email', 'Address', 'Suburb', 'Province', 'Temple', 'Registration Date'];
    const csvData = filteredUsers.map(user => [
      user.firstName,
      user.surname,
      `+27${user.cellphone}`,
      user.email || '',
      user.address,
      user.suburb,
      user.province,
      user.temple,
      formatDate(user.registrationDate)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mymtn-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    router.push('/admin/login');
  };

  // Don't render anything until authentication is checked
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">Admin Dashboard</h1>
                <p className="text-sm sm:text-base text-black">View and manage myMTN registrations</p>
              </div>
              <div className="flex gap-3">
                <Link 
                  href="/"
                  className="inline-flex items-center px-4 py-2 border-2 border-black text-black font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border-2 border-black text-black font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Search and Export */}
          <div className="border-2 border-black rounded-lg p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, phone, email, address, suburb, province, or temple..."
                  className="w-full px-4 py-3 rounded-lg border border-black focus:outline-none focus:ring-1 focus:ring-black bg-white"
                />
              </div>
              <button
                onClick={exportToCSV}
                disabled={filteredUsers.length === 0}
                className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="border-2 border-black rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mx-auto mb-4"></div>
                <p className="text-black text-sm">Loading registrations...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-black font-medium mb-4">Error: {error}</p>
                <button
                  onClick={fetchUsers}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-black">No registrations found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Temple</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-black">
                            {user.firstName} {user.surname}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-black">+27{user.cellphone}</div>
                          {user.email && (
                            <div className="text-xs text-gray-600 mt-1">{user.email}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-black">{user.suburb}, {user.province}</div>
                          <div className="text-xs text-gray-600 mt-1">{user.address}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-black">{user.temple}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-black">{formatDate(user.registrationDate)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-black">
            <p>Showing {filteredUsers.length} of {users.length} total registrations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
