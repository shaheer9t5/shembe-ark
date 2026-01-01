'use client';

import { useState, useEffect, useRef } from 'react';

interface CustomDropdownProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[] | string[];
  placeholder: string;
  error?: string;
  className?: string;
}

export default function CustomDropdown({
  id,
  value,
  onChange,
  options,
  placeholder,
  error,
  className = ''
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = value || placeholder;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer bg-white text-left flex items-center justify-between ${
          error ? 'border-red-500' : 'border-black'
        } ${!value ? 'text-gray-500' : 'text-black'}`}
        style={{ fontFamily: 'var(--font-montserrat), -apple-system, BlinkMacSystemFont, sans-serif' }}
      >
        <span>{selectedOption}</span>
        <svg
          className={`w-5 h-5 text-black transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-black rounded shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                value === option ? 'bg-gray-100 font-medium' : 'text-black'
              }`}
              style={{ fontFamily: 'var(--font-montserrat), -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

