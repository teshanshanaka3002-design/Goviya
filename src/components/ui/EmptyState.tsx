import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <View
      className={`flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-dashed border-[#D1D5DB] my-4 ${className}`}
    >
      {icon && (
        <View className="w-14 h-14 rounded-full bg-[#E6F2E8] text-[#1F5C3A] items-center justify-center mb-3">
          {icon}
        </View>
      )}
      <Text className="text-base font-bold text-[#1A1A1A] mb-1 text-center">{title}</Text>
      <Text className="text-xs text-[#6B7280] max-w-xs mb-4 text-center leading-relaxed">{description}</Text>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <View style={{ gap: 12, width: '100%', padding: 16 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} className="bg-[#E5E7EB] h-16 rounded-2xl w-full my-1.5" />
      ))}
    </View>
  );
};
