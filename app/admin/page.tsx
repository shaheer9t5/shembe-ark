'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@/types';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (authenticated) {
        setPage(1); // Reset to first page on new search
        fetchUsers();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, authenticated]);

  // Fetch users when page changes
  useEffect(() => {
    if (authenticated) {
      fetchUsers();
    }
  }, [page, authenticated]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/register?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      setUsers(data.users || []);
      setTotalUsers(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setHasNextPage(data.hasNextPage || false);
      setHasPrevPage(data.hasPrevPage || false);
      setError('');
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
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

  const exportToCSV = async () => {
    try {
      // Fetch all users matching the search (no pagination for export)
      const params = new URLSearchParams({
        page: '1',
        limit: '10000' // Large limit to get all results
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/register?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users for export');
      }

      const headers = ['First Name', 'Surname', 'Cellphone', 'Email', 'Address', 'Suburb', 'Province', 'Temple', 'Registration Date'];
      const csvData = data.users.map((user: User) => [
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
        .map(row => row.map((cell: string) => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mymtn-registrations-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
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
          {/* Logo */}
          <div className="text-center mb-8">
            <Image
              src="/shembe-ark.svg"
              alt="Shembe Ark"
              width={400}
              height={40}
              priority
              className="h-auto w-auto max-w-[400px] mx-auto"
            />
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">Admin Dashboard</h1>
                <p className="text-sm sm:text-base text-black">View and manage myMTN registrations</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border-2 border-black text-black font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer"
              >
                Logout
              </button>
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
                disabled={users.length === 0}
                className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* Total Records */}
          <div className="mb-4 text-sm text-black">
            <p className="font-medium">Total Registrations: {totalUsers}</p>
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
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            ) : users.length === 0 ? (
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
                    {users.map((user) => (
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

          {/* Pagination */}
          {users.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-black">
                <p>Page {page} of {totalPages}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!hasPrevPage}
                  className="px-4 py-2 border-2 border-black text-black font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!hasNextPage}
                  className="px-4 py-2 border-2 border-black text-black font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
