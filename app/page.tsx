'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import CustomDropdown from '@/components/CustomDropdown';
import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/context/LanguageContext';
import { FormData, FormErrors } from '@/types';
import { getTranslatedProvinces } from '@/constants';

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();
  
  // Get translated province options
  const translatedProvinces = getTranslatedProvinces(t);
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
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('registration.validation.firstNameRequired');
    }

    if (!formData.surname.trim()) {
      newErrors.surname = t('registration.validation.surnameRequired');
    }

    if (!formData.cellphone.trim()) {
      newErrors.cellphone = t('registration.validation.cellphoneRequired');
    } else if (!/^[6-8][0-9]{8}$/.test(formData.cellphone.replace(/\s/g, ''))) {
      newErrors.cellphone = t('registration.validation.cellphoneInvalid');
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('registration.validation.emailInvalid');
    }

    if (!formData.address.trim()) {
      newErrors.address = t('registration.validation.addressRequired');
    }

    if (!formData.suburb.trim()) {
      newErrors.suburb = t('registration.validation.suburbRequired');
    }

    if (!formData.province) {
      newErrors.province = t('registration.validation.provinceRequired');
    }

    if (!formData.temple.trim()) {
      newErrors.temple = t('registration.validation.templeRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeToTerms) {
      alert(t('registration.validation.termsRequired'));
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
          setErrors({ cellphone: t('registration.validation.cellphoneExists') });
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
          alert(t('registration.messages.registrationFailed', { error: data.error || 'Unknown error occurred' }));
        }
        return;
      }

      // Success - redirect to download page
      router.push('/download');

    } catch (error) {
      console.error('Registration error:', error);
      alert(t('registration.messages.genericError'));
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

        {/* Right Side: Form (Desktop) / Full Content (Mobile) */}
        <div className="w-full lg:w-[45%] flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-2xl lg:max-w-none">
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

          {/* Registration Form */}
          <div className="bg-white py-8 px-4 sm:px-8 md:px-10 xl:px-24">
            {/* Header */}
            <div className="mb-10">
              <h2 className="text-xl sm:text-2xl font-bold text-black mb-2 text-left">{t('registration.title')}</h2>
              <p className="text-sm sm:text-base text-black text-left">{t('registration.subtitle')}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-1 focus:ring-black bg-white dark:text-black ${
                      errors.firstName 
                        ? 'border-red-500' 
                        : 'border-black'
                    }`}
                    placeholder={t('registration.form.firstName')}
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
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-1 focus:ring-black bg-white dark:text-black ${
                      errors.surname 
                        ? 'border-red-500' 
                        : 'border-black'
                    }`}
                    placeholder={t('registration.form.surname')}
                  />
                  {errors.surname && (
                    <p className="text-red-500 text-sm mt-1">{errors.surname}</p>
                  )}
                </div>
              </div>

              {/* Cellphone */}
              <div>
                <div className="flex">
                  <div className="flex items-center px-3 sm:px-4 py-3 bg-gray-800 text-white rounded-l-lg border border-black text-sm sm:text-base">
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
                    className={`flex-1 px-4 py-3 rounded-r-lg border focus:outline-none focus:ring-1 focus:ring-black bg-white dark:text-black ${
                      errors.cellphone 
                        ? 'border-red-500' 
                        : 'border-black'
                    }`}
                    placeholder={t('registration.form.cellphone')}
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
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-1 focus:ring-black bg-white dark:text-black ${
                    errors.email 
                      ? 'border-red-500' 
                      : 'border-black'
                  }`}
                  placeholder={t('registration.form.email')}
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
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-1 focus:ring-black bg-white dark:text-black ${
                    errors.address 
                      ? 'border-red-500' 
                      : 'border-black'
                  }`}
                  placeholder={t('registration.form.address')}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    id="suburb"
                    value={formData.suburb}
                    onChange={(e) => handleInputChange('suburb', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-1 focus:ring-black bg-white dark:text-black ${
                      errors.suburb 
                        ? 'border-red-500' 
                        : 'border-black'
                    }`}
                    placeholder={t('registration.form.suburb')}
                  />
                  {errors.suburb && (
                    <p className="text-red-500 text-sm mt-1">{errors.suburb}</p>
                  )}
                </div>

                <div>
                  <CustomDropdown
                    id="province"
                    value={formData.province}
                    onChange={(value) => handleInputChange('province', value)}
                    options={translatedProvinces}
                    placeholder={t('registration.form.province')}
                    error={errors.province}
                  />
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
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-1 focus:ring-black bg-white dark:text-black ${
                    errors.temple 
                      ? 'border-red-500' 
                      : 'border-black'
                  }`}
                  placeholder={t('registration.form.temple')}
                />
                {errors.temple && (
                  <p className="text-red-500 text-sm mt-1">{errors.temple}</p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start pt-2">
                <div className="relative mt-1">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="w-5 h-5 border border-black rounded-full appearance-none cursor-pointer"
                  />
                  {agreeToTerms && (
                    <svg
                      className="absolute top-0 left-0 w-5 h-5 pointer-events-none"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M6 10l2 2 6-6"
                        stroke="black"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <label htmlFor="agreeToTerms" className="ml-2 mt-0.75 text-xs sm:text-sm text-black cursor-pointer">
                  By registering, you agree to our <span className="underline">{t('registration.form.termsOfService')}</span> and <span className="underline">{t('registration.form.privacyPolicy')}</span>.
                </label>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !agreeToTerms}
                  className="w-full sm:flex-1 px-6 py-3 bg-black text-white font-semibold rounded-lg transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                      {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('registration.buttons.registering')}
                    </span>
                  ) : (
                    t('registration.buttons.register')
                  )}
                </button>
              </div>
            </form>
          </div>

            {/* Footer */}
            <div className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-gray-400 px-4">
              <p>{t('footer.copyright')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

