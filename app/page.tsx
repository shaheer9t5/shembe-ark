'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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
  const [agreeToTerms, setAgreeToTerms] = useState(true);

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
    
    if (!agreeToTerms) {
      alert('Please agree to the terms of service and privacy policy to continue.');
      return;
    }
    
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
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/shembe-ark.svg"
                alt="Shembe Ark"
                width={320}
                height={32}
                priority
                className="h-auto"
              />
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">Free Internet Access</h2>
            <p className="text-base text-black">Register to receive complimentary internet access on your mobile device.</p>
          </div>

          {/* Registration Form */}
          <div className="bg-white p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-3 rounded border border-black focus:outline-none focus:ring-1 focus:ring-black ${
                      errors.firstName 
                        ? 'border-red-500 bg-red-50' 
                        : 'bg-white'
                    }`}
                    placeholder="First name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    id="surname"
                    value={formData.surname}
                    onChange={(e) => handleInputChange('surname', e.target.value)}
                    className={`w-full px-4 py-3 rounded border border-black focus:outline-none focus:ring-1 focus:ring-black ${
                      errors.surname 
                        ? 'border-red-500 bg-red-50' 
                        : 'bg-white'
                    }`}
                    placeholder="Surname"
                  />
                  {errors.surname && (
                    <p className="text-red-500 text-sm mt-1">{errors.surname}</p>
                  )}
                </div>
              </div>

              {/* Cellphone */}
              <div>
                <div className="flex">
                  <div className="flex items-center px-4 py-3 bg-gray-800 text-white rounded-l border border-black">
                    <span className="font-medium">+27</span>
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
                    className={`flex-1 px-4 py-3 rounded-r border border-black focus:outline-none focus:ring-1 focus:ring-black ${
                      errors.cellphone 
                        ? 'border-red-500 bg-red-50' 
                        : 'bg-white'
                    }`}
                    placeholder="Phone number"
                  />
                </div>
                {errors.cellphone && (
                  <p className="text-red-500 text-sm mt-1">{errors.cellphone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 rounded border border-black focus:outline-none focus:ring-1 focus:ring-black ${
                    errors.email 
                      ? 'border-red-500 bg-red-50' 
                      : 'bg-white'
                  }`}
                  placeholder="Email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Residential Address */}
              <div>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`w-full px-4 py-3 rounded border border-black focus:outline-none focus:ring-1 focus:ring-black ${
                    errors.address 
                      ? 'border-red-500 bg-red-50' 
                      : 'bg-white'
                  }`}
                  placeholder="Residential address"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    id="suburb"
                    value={formData.suburb}
                    onChange={(e) => handleInputChange('suburb', e.target.value)}
                    className={`w-full px-4 py-3 rounded border border-black focus:outline-none focus:ring-1 focus:ring-black ${
                      errors.suburb 
                        ? 'border-red-500 bg-red-50' 
                        : 'bg-white'
                    }`}
                    placeholder="Suburb"
                  />
                  {errors.suburb && (
                    <p className="text-red-500 text-sm mt-1">{errors.suburb}</p>
                  )}
                </div>

                <div>
                  <select
                    id="province"
                    value={formData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    className={`w-full px-4 py-3 rounded border border-black focus:outline-none focus:ring-1 focus:ring-black ${
                      errors.province 
                        ? 'border-red-500 bg-red-50' 
                        : 'bg-white'
                    }`}
                  >
                    <option value="">Province</option>
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
                <input
                  type="text"
                  id="temple"
                  value={formData.temple}
                  onChange={(e) => handleInputChange('temple', e.target.value)}
                  className={`w-full px-4 py-3 rounded border border-black focus:outline-none focus:ring-1 focus:ring-black ${
                    errors.temple 
                      ? 'border-red-500 bg-red-50' 
                      : 'bg-white'
                  }`}
                  placeholder="Temple Name"
                />
                {errors.temple && (
                  <p className="text-red-500 text-sm mt-1">{errors.temple}</p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start pt-2">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-black border-black rounded focus:ring-black"
                />
                <label htmlFor="agreeToTerms" className="ml-2 text-sm text-black">
                  By registering, you agree to our terms of service and privacy policy.
                </label>
              </div>

              {/* Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !agreeToTerms}
                  className="flex-1 px-6 py-3 bg-black text-white font-semibold rounded transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
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
                    'Register Yourself'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-400">
            <p>© 2026 | Shembe Ark | All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

