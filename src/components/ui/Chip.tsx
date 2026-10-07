import React from 'react';
import { Pressable, Text, View } from 'react-native';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  onPress?: () => void;
  icon?: React.ReactNode;
  count?: number;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onClick,
  onPress,
  icon,
  count,
  className = '',
}) => {
  const handlePress = onPress || onClick;
  return (
    <Pressable
      onPress={handlePress}
      className={`flex-row items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-medium shrink-0 ${
        selected
          ? 'bg-[#1F5C3A]'
          : 'bg-[#F0F2EE]'
      } ${className}`}
    >
      {icon && <View className="shrink-0">{icon}</View>}
      <Text className={`text-xs ${selected ? 'text-white font-medium' : 'text-[#4B5563]'}`}>
        {label}
      </Text>
      {count !== undefined && (
        <View
          className={`px-1.5 py-0.5 rounded-full ${
            selected ? 'bg-white/25' : 'bg-black/10'
          }`}
        >
          <Text className={`text-[10px] font-semibold ${selected ? 'text-white' : 'text-[#4B5563]'}`}>
            {count}
          </Text>
        </View>
      )}
    </Pressable>
  );
};
