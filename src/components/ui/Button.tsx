import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'destructive' | 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none cursor-pointer';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 h-8 gap-1.5',
    md: 'text-sm px-4 py-2.5 h-11 min-h-[44px] gap-2',
    lg: 'text-base px-6 py-3 h-13 min-h-[48px] gap-2.5 font-semibold',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#1F5C3A] text-white hover:bg-[#16452B] active:bg-[#123622] shadow-sm',
    outline:
      'border border-[#E5E5E5] text-[#1A1A1A] bg-white hover:bg-[#F6F7F5] active:bg-[#ECEEEA]',
    destructive:
      'bg-[#C8452D] text-white hover:bg-[#AF3A23] active:bg-[#962F1B] shadow-sm',
    ghost:
      'text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F0F2EE] active:bg-[#E5E8E2]',
    secondary:
      'bg-[#E6F2E8] text-[#1F5C3A] hover:bg-[#D5EAD8] active:bg-[#C2DFCA] font-semibold',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span className="truncate whitespace-nowrap">{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
