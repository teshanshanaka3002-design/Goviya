import React from 'react';
import { View, Pressable } from 'react-native';

export interface CardProps {
  variant?: 'default' | 'flat' | 'interactive' | 'mint';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
  onPress?: () => void;
  style?: any;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onPress,
  ...props
}) => {
  const baseClasses = 'bg-white rounded-2xl relative overflow-hidden';

  const variantClasses = {
    default: 'border border-[#E5E5E5]',
    flat: 'border border-[#EFEFEF] bg-[#FAFAFA]',
    interactive: 'border border-[#E5E5E5]',
    mint: 'border border-[#CDE5D2] bg-[#F2F8F4]',
  }[variant];

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  }[padding];

  const Component = onPress || variant === 'interactive' ? Pressable : View;

  return (
    <Component
      onPress={onPress}
      className={`${baseClasses} ${variantClasses} ${paddingClasses} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};
