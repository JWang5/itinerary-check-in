import { InitOptions } from 'i18next';
import en from './en.json';
import zh from './zh.json';

export const languageResources = {
  en: { translation: en },
  zh: { translation: zh },
};

export const i18nConfig: InitOptions = {
  compatibilityJSON: 'v4',
  resources: languageResources,
  fallbackLng: 'zh', // Default language
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
};
