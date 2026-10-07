import React from 'react';
import { View, Text, Image } from 'react-native';

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  role?: string;
  className?: string;
  imageUrl?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  role,
  className = '',
  imageUrl,
}) => {
  const initials = name
    ? name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-14 h-14 text-base font-bold',
    xl: 'w-20 h-20 text-xl font-bold',
  }[size];

  // Role color accent
  const roleBg =
    role === 'farmer'
      ? 'bg-[#1F5C3A] text-white'
      : role === 'driver'
      ? 'bg-[#2E8C9F] text-white'
      : role === 'admin'
      ? 'bg-[#7C3AED] text-white'
      : 'bg-[#2D6A4F] text-[#E6F2E8]';

  return (
    <View
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 overflow-hidden ${sizeClasses} ${
        imageUrl ? 'bg-slate-100' : roleBg
      } ${className}`}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <Text className="text-white font-bold">{initials}</Text>
      )}
    </View>
  );
};
