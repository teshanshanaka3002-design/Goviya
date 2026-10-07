import React from 'react';
import { Search, X } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-[#1A1A1A] mb-1.5 uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-[#6B7280] pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full h-11 min-h-[44px] bg-[#FFFFFF] border rounded-xl text-sm text-[#1A1A1A] placeholder-[#9CA3AF] transition-all focus:outline-none focus:ring-2 focus:ring-[#1F5C3A]/20 focus:border-[#1F5C3A] ${
            leftIcon ? 'pl-10' : 'pl-3.5'
          } ${rightIcon ? 'pr-10' : 'pr-3.5'} ${
            error ? 'border-[#C8452D] focus:border-[#C8452D] focus:ring-[#C8452D]/20' : 'border-[#E5E5E5]'
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 text-[#6B7280] flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs text-[#C8452D] mt-1 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#6B7280] mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};

export interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  onFocus?: () => void;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search fresh produce, farmers, regions...',
  autoFocus = false,
  onFocus,
  className = '',
}) => {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <Search className="w-4 h-4 text-[#1F5C3A] absolute left-3.5 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={onFocus}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="w-full h-11 min-h-[44px] pl-10 pr-9 bg-[#E6F2E8]/60 hover:bg-[#E6F2E8]/90 focus:bg-white border border-transparent focus:border-[#1F5C3A] rounded-xl text-sm text-[#1A1A1A] placeholder-[#4B6B56] transition-all focus:outline-none focus:ring-2 focus:ring-[#1F5C3A]/15"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          className="absolute right-3 p-1 text-[#6B7280] hover:text-[#1A1A1A] rounded-full"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
