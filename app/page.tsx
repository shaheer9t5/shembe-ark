'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// South African provinces
const SA_PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape'
];

interface FormData {
  firstName: string;
  surname: string;
  cellphone: string;
  email: string;
  address: string;
  suburb: string;
  province: string;
  temple: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    surname: '',
    cellphone: '',
    email: '',
    address: '',
    suburb: '',
    province: '',
    temple: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.surname.trim()) {
      newErrors.surname = 'Surname is required';
    }

    if (!formData.cellphone.trim()) {
      newErrors.cellphone = 'Cellphone number is required';
    } else if (!/^[6-8][0-9]{8}$/.test(formData.cellphone.replace(/\s/g, ''))) {
      newErrors.cellphone = 'Please enter a valid 9-digit cellphone number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Residential address is required';
    }

    if (!formData.suburb.trim()) {
      newErrors.suburb = 'Suburb is required';
    }

    if (!formData.province) {
      newErrors.province = 'Province is required';
    }

    if (!formData.temple.trim()) {
      newErrors.temple = 'Temple name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Submit to API
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle API errors
        if (response.status === 409) {
          // User already exists
          setErrors({ cellphone: 'This cellphone number is already registered' });
        } else if (data.details) {
          // Validation errors from server
          const newErrors: FormErrors = {};
          data.details.forEach((detail: string) => {
            if (detail.includes('First name')) newErrors.firstName = detail;
            else if (detail.includes('Surname')) newErrors.surname = detail;
            else if (detail.includes('cellphone')) newErrors.cellphone = detail;
            else if (detail.includes('email')) newErrors.email = detail;
            else if (detail.includes('address')) newErrors.address = detail;
            else if (detail.includes('Suburb')) newErrors.suburb = detail;
            else if (detail.includes('Province')) newErrors.province = detail;
            else if (detail.includes('Temple')) newErrors.temple = detail;
          });
          setErrors(newErrors);
        } else {
          // Generic error
          alert(`Registration failed: ${data.error || 'Unknown error occurred'}`);
        }
        return;
      }

      // Success - redirect to download page
      router.push('/download');

    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: '',
      surname: '',
      cellphone: '',
      email: '',
      address: '',
      suburb: '',
      province: '',
      temple: ''
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-yellow-200/30 to-orange-200/30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m9-9H3" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">ShembeArk</h1>
            <p className="text-gray-600">Register for complimentary internet access</p>
          </div>

          {/* Registration Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                      errors.firstName 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200 bg-white hover:border-orange-300 focus:border-orange-500'
                    }`}
                    placeholder="Your first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="surname" className="block text-sm font-semibold text-gray-700 mb-2">
                    Surname *
                  </label>
                  <input
                    type="text"
                    id="surname"
                    value={formData.surname}
                    onChange={(e) => handleInputChange('surname', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                      errors.surname 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200 bg-white hover:border-orange-300 focus:border-orange-500'
                    }`}
                    placeholder="Your surname"
                  />
                  {errors.surname && (
                    <p className="text-red-500 text-sm mt-1">{errors.surname}</p>
                  )}
                </div>
              </div>

              {/* Cellphone */}
              <div>
                <label htmlFor="cellphone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Cellphone Number *
                </label>
                <div className="flex">
                  <div className="flex items-center px-4 py-3 bg-gray-100 border-2 border-r-0 border-gray-200 rounded-l-lg">
                    <span className="text-gray-700 font-medium">+27</span>
                  </div>
                  <input
                    type="tel"
                    id="cellphone"
                    value={formData.cellphone}
                    onChange={(e) => {
                      // Only allow digits
                      const value = e.target.value.replace(/\D/g, '');
                      handleInputChange('cellphone', value);
                    }}
                    maxLength={9}
                    className={`flex-1 px-4 py-3 rounded-r-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                      errors.cellphone 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200 bg-white hover:border-orange-300 focus:border-orange-500'
                    }`}
                    placeholder="821234567"
                  />
                </div>
                {errors.cellphone && (
                  <p className="text-red-500 text-sm mt-1">{errors.cellphone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                    errors.email 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 bg-white hover:border-orange-300 focus:border-orange-500'
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Residential Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                  Residential Address *
                </label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                    errors.address 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 bg-white hover:border-orange-300 focus:border-orange-500'
                  }`}
                  placeholder="Your full residential address"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="suburb" className="block text-sm font-semibold text-gray-700 mb-2">
                    Suburb *
                  </label>
                  <input
                    type="text"
                    id="suburb"
                    value={formData.suburb}
                    onChange={(e) => handleInputChange('suburb', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                      errors.suburb 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200 bg-white hover:border-orange-300 focus:border-orange-500'
                    }`}
                    placeholder="Your suburb"
                  />
                  {errors.suburb && (
                    <p className="text-red-500 text-sm mt-1">{errors.suburb}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="province" className="block text-sm font-semibold text-gray-700 mb-2">
                    Province *
                  </label>
                  <select
                    id="province"
                    value={formData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                      errors.province 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200 bg-white hover:border-orange-300 focus:border-orange-500'
                    }`}
                  >
                    <option value="">Select Province</option>
                    {SA_PROVINCES.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                  {errors.province && (
                    <p className="text-red-500 text-sm mt-1">{errors.province}</p>
                  )}
                </div>
              </div>

              {/* Temple */}
              <div>
                <label htmlFor="temple" className="block text-sm font-semibold text-gray-700 mb-2">
                  Temple Name *
                </label>
                <input
                  type="text"
                  id="temple"
                  value={formData.temple}
                  onChange={(e) => handleInputChange('temple', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                    errors.temple 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 bg-white hover:border-orange-300 focus:border-orange-500'
                  }`}
                  placeholder="Name of your associated temple"
                />
                {errors.temple && (
                  <p className="text-red-500 text-sm mt-1">{errors.temple}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold shadow-lg transition-all hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Submit Registration'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-600">
            <p>By registering, you agree to our terms of service and privacy policy.</p>
            <div className="mt-4">
              <Link 
                href="/admin"
                className="text-blue-600 hover:text-blue-800 underline text-xs"
              >
                Admin: View Registration Data
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

