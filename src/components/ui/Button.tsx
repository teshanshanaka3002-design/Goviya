import React from 'react';
import {
  Pressable,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'mint';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  isLoading = false,
  disabled = false,
  onPress,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || isLoading;

  const sizeStyle = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
  }[size];

  const textSizeStyle = {
    sm: styles.textSizeSm,
    md: styles.textSizeMd,
    lg: styles.textSizeLg,
  }[size];

  const variantStyle = {
    primary: styles.variantPrimary,
    secondary: styles.variantSecondary,
    outline: styles.variantOutline,
    destructive: styles.variantDestructive,
    ghost: styles.variantGhost,
    mint: styles.variantMint,
  }[variant];

  const textVariantStyle = {
    primary: styles.textPrimary,
    secondary: styles.textSecondary,
    outline: styles.textOutline,
    destructive: styles.textDestructive,
    ghost: styles.textGhost,
    mint: styles.textMint,
  }[variant];

  const indicatorColor =
    variant === 'primary' || variant === 'destructive' ? '#FFFFFF' : '#1F5C3A';

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.baseButton,
        sizeStyle,
        variantStyle,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={indicatorColor} style={styles.spinner} />
      ) : (
        leftIcon && <View style={styles.iconWrapper}>{leftIcon}</View>
      )}

      {children == null ? null : React.isValidElement(children) ? (
        children
      ) : (
        <Text
          numberOfLines={1}
          style={[styles.baseText, textSizeStyle, textVariantStyle, textStyle]}
        >
          {children}
        </Text>
      )}

      {!isLoading && rightIcon && (
        <View style={styles.iconWrapper}>{rightIcon}</View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.5,
  },
  // Sizes
  sizeSm: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  sizeMd: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  sizeLg: {
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 8,
  },
  // Variants
  variantPrimary: {
    backgroundColor: '#1F5C3A',
    borderColor: '#1F5C3A',
    shadowColor: '#1F5C3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  variantSecondary: {
    backgroundColor: '#E6F2E8',
    borderColor: '#CDE5D2',
  },
  variantOutline: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  variantDestructive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  variantGhost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  variantMint: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  // Text sizes
  textSizeSm: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  textSizeMd: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '700',
  },
  textSizeLg: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },
  // Text colors
  baseText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    letterSpacing: 0.2,
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textSecondary: {
    color: '#1F5C3A',
  },
  textOutline: {
    color: '#1E293B',
  },
  textDestructive: {
    color: '#FFFFFF',
  },
  textGhost: {
    color: '#475569',
  },
  textMint: {
    color: '#166534',
  },
  // Icons & Spinners
  spinner: {
    marginRight: 6,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
