import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, TranslationDictionary } from './types';
import { en } from './translations/en';
import { si } from './translations/si';
import { ta } from './translations/ta';

const ASYNC_STORAGE_LANG_KEY = '@goviya_app_language';

const translations: Record<Language, TranslationDictionary> = {
  en,
  si,
  ta,
};

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  t: (key, fallback) => fallback || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Load persisted language from AsyncStorage on mount
  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem(ASYNC_STORAGE_LANG_KEY);
        if (saved === 'en' || saved === 'si' || saved === 'ta') {
          setLanguageState(saved);
        }
      } catch (err) {
        console.warn('Could not load saved language:', err);
      }
    };
    loadSavedLanguage();
  }, []);

  const setLanguage = async (newLang: Language) => {
    // 1. Immediate UI update
    setLanguageState(newLang);
    // 2. Persist to AsyncStorage
    try {
      await AsyncStorage.setItem(ASYNC_STORAGE_LANG_KEY, newLang);
    } catch (err) {
      console.warn('Could not save language to AsyncStorage:', err);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const currentDict = translations[language];
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }
    // Fallback to English
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return fallback !== undefined ? fallback : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  return useContext(LanguageContext);
};
