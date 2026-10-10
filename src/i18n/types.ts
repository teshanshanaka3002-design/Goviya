export type Language = 'en' | 'si' | 'ta';

export interface LanguageOption {
  code: Language;
  label: string;
  shortLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'si', label: 'සිංහල', shortLabel: 'සිං' },
  { code: 'ta', label: 'தமிழ்', shortLabel: 'தமிழ்' },
];

export type TranslationDictionary = Record<string, string>;
