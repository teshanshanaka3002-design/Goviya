import React from 'react';
import { Pressable, Text, View, ActivityIndicator } from 'react-native';

export interface ButtonProps {
  variant?: 'primary' | 'outline' | 'destructive' | 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onPress?: () => void;
  style?: any;
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
  onPress,
  ...props
}) => {
  const baseClasses =
    'flex-row items-center justify-center font-medium rounded-xl';

  const sizeClasses = {
    sm: 'px-3 py-1.5 h-8 gap-1.5',
    md: 'px-4 py-2.5 h-11 min-h-[44px] gap-2',
    lg: 'px-6 py-3 h-12 min-h-[48px] gap-2.5',
  }[size];

  const textClasses = {
    sm: 'text-xs',
    md: 'text-sm font-medium',
    lg: 'text-base font-semibold',
  }[size];

  const variantClasses = {
    primary: 'bg-[#1F5C3A] text-white',
    outline: 'border border-[#E5E5E5] text-[#1A1A1A] bg-white',
    destructive: 'bg-[#C8452D] text-white',
    ghost: 'text-[#6B7280]',
    secondary: 'bg-[#E6F2E8] text-[#1F5C3A]',
  }[variant];

  const textColorClass = {
    primary: 'text-white',
    outline: 'text-[#1A1A1A]',
    destructive: 'text-white',
    ghost: 'text-[#6B7280]',
    secondary: 'text-[#1F5C3A]',
  }[variant];

  return (
    <Pressable
      onPress={disabled || isLoading ? undefined : onPress}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${
        fullWidth ? 'w-full' : ''
      } ${disabled || isLoading ? 'opacity-50' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={variant === 'outline' || variant === 'ghost' ? '#1F5C3A' : '#ffffff'} className="mr-1.5" />
      ) : (
        leftIcon && <View className="shrink-0">{leftIcon}</View>
      )}
      {!React.isValidElement(children) ? (
        <Text className={`${textClasses} ${textColorClass}`}>{children}</Text>
      ) : (
        children
      )}
      {!isLoading && rightIcon && <View className="shrink-0">{rightIcon}</View>}
    </Pressable>
  );
};
