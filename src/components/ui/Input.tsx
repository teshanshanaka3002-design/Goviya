import React from 'react';
import { View, Text, TextInput, Pressable, TextInputProps } from 'react-native';
import { Search, X } from 'lucide-react-native';

export interface InputProps extends Omit<TextInputProps, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onChange?: (e: any) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  value,
  onChangeText,
  onChange,
  placeholder,
  ...props
}) => {
  const handleChangeText = (text: string) => {
    if (onChangeText) onChangeText(text);
    if (onChange) onChange({ target: { value: text } });
  };

  return (
    <View className="w-full">
      {label && (
        <Text className="text-xs font-semibold text-[#1A1A1A] mb-1.5 uppercase tracking-wider">
          {label}
        </Text>
      )}
      <View className="relative flex-row items-center">
        {leftIcon && (
          <View className="absolute left-3.5 z-10">
            {leftIcon}
          </View>
        )}
        <TextInput
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          className={`w-full h-11 min-h-[44px] bg-[#FFFFFF] border rounded-xl text-sm text-[#1A1A1A] ${
            leftIcon ? 'pl-10' : 'pl-3.5'
          } ${rightIcon ? 'pr-10' : 'pr-3.5'} ${
            error ? 'border-[#C8452D]' : 'border-[#E5E5E5]'
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <View className="absolute right-3.5 z-10">
            {rightIcon}
          </View>
        )}
      </View>
      {error ? (
        <Text className="text-xs text-[#C8452D] mt-1 font-medium">{error}</Text>
      ) : helperText ? (
        <Text className="text-xs text-[#6B7280] mt-1">{helperText}</Text>
      ) : null}
    </View>
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
    <View className={`relative flex-row items-center w-full ${className}`}>
      <View className="absolute left-3.5 z-10">
        <Search size={16} color="#1F5C3A" />
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        onFocus={onFocus}
        autoFocus={autoFocus}
        placeholder={placeholder}
        placeholderTextColor="#4B6B56"
        className="w-full h-11 min-h-[44px] pl-10 pr-9 bg-[#E6F2E8] border border-transparent rounded-xl text-sm text-[#1A1A1A]"
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => {
            onChange('');
            onClear?.();
          }}
          className="absolute right-3 z-10 p-1 rounded-full"
        >
          <X size={14} color="#6B7280" />
        </Pressable>
      )}
    </View>
  );
};
