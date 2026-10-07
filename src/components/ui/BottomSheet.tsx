import React from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        <Pressable className="flex-1" onPress={onClose} />
        
        <View className="w-full max-h-[88%] bg-white rounded-t-3xl overflow-hidden flex-col shadow-2xl">
          {/* Grab Handle */}
          <View className="pt-2.5 pb-1 items-center shrink-0">
            <View className="w-10 h-1 bg-[#D1D5DB] rounded-full" />
          </View>

          {/* Header */}
          {title && (
            <View className="flex-row items-center justify-between px-4 py-2.5 border-b border-[#E5E5E5] shrink-0">
              <Text className="text-sm font-bold text-[#1A1A1A] flex-1 mr-2">{title}</Text>
              <Pressable
                onPress={onClose}
                className="p-1.5 rounded-full bg-slate-100"
              >
                <X size={16} color="#6B7280" />
              </Pressable>
            </View>
          )}

          {/* Scrollable Content */}
          <ScrollView className="px-4 py-3 flex-1" contentContainerStyle={{ paddingBottom: 16 }}>
            {children}
          </ScrollView>

          {/* Sticky Action Footer */}
          {footer && (
            <View className="p-3.5 pb-8 bg-white border-t border-[#E5E5E5] shrink-0 z-20">
              {footer}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
