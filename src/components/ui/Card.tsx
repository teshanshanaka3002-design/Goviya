import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'interactive' | 'mint';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'bg-white rounded-2xl transition-all duration-150 relative overflow-hidden';

  const variantClasses = {
    default: 'border border-[#E5E5E5] shadow-xs',
    flat: 'border border-[#EFEFEF] bg-[#FAFAFA]',
    interactive:
      'border border-[#E5E5E5] shadow-xs hover:border-[#1F5C3A]/40 hover:shadow-md cursor-pointer active:scale-[0.99]',
    mint: 'border border-[#CDE5D2] bg-[#F2F8F4]',
  }[variant];

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  }[padding];

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${paddingClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
