import React from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxHeight?: number | string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxHeight = '90%',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={sheetStyles.overlay}>
        <Pressable style={sheetStyles.backdrop} onPress={onClose} />

        <View style={[sheetStyles.sheetContainer, { maxHeight: (maxHeight as any) }]}>
          {/* Grab Handle */}
          <View style={sheetStyles.handleContainer}>
            <View style={sheetStyles.handle} />
          </View>

          {/* Header */}
          {Boolean(title) && (
            <View style={sheetStyles.header}>
              <Text style={sheetStyles.title} numberOfLines={1}>
                {title}
              </Text>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  sheetStyles.closeBtn,
                  pressed && { opacity: 0.7, backgroundColor: '#E2E8F0' },
                ]}
              >
                <X size={17} color="#4B5563" strokeWidth={2.2} />
              </Pressable>
            </View>
          )}

          {/* Scrollable Content */}
          <ScrollView
            style={sheetStyles.scrollContent}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: footer ? 16 : Math.max(insets.bottom, 20),
            }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {/* Sticky Action Footer with Safe Area */}
          {footer && (
            <View
              style={[
                sheetStyles.footer,
                { paddingBottom: Math.max(insets.bottom, 16) },
              ]}
            >
              {footer}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const sheetStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  handleContainer: {
    paddingTop: 10,
    paddingBottom: 6,
    alignItems: 'center',
  },
  handle: {
    width: 44,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 99,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 10,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexShrink: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
});
