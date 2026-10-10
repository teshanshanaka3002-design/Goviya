import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLanguage } from '../../i18n';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setLanguage('en')}
        style={[styles.item, language === 'en' && styles.itemActive]}
        hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
      >
        <Text style={[styles.text, language === 'en' && styles.textActive]}>EN</Text>
      </Pressable>

      <Text style={styles.divider}>|</Text>

      <Pressable
        onPress={() => setLanguage('si')}
        style={[styles.item, language === 'si' && styles.itemActive]}
        hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
      >
        <Text style={[styles.text, language === 'si' && styles.textActive]}>සිං</Text>
      </Pressable>

      <Text style={styles.divider}>|</Text>

      <Pressable
        onPress={() => setLanguage('ta')}
        style={[styles.item, language === 'ta' && styles.itemActive]}
        hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
      >
        <Text style={[styles.text, language === 'ta' && styles.textActive]}>தமிழ்</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 2.5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  item: {
    paddingHorizontal: 6.5,
    paddingVertical: 2.5,
    borderRadius: 14,
  },
  itemActive: {
    backgroundColor: '#1F5C3A',
  },
  text: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#4B5563',
  },
  textActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  divider: {
    fontSize: 10,
    color: '#CBD5E1',
    marginHorizontal: 1,
  },
});
