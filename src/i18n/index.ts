import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { i18nConfig } from './config';

const LANGUAGE_KEY = 'user-language';

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string | readonly string[] | undefined) => void) => {
    try {
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (storedLanguage) {
        return callback(storedLanguage);
      }
      return callback('zh');
    } catch (error) {
      console.log('Error reading language', error);
      return callback('zh');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.log('Error saving language', error);
    }
  },
};

i18n.use(initReactI18next).use(languageDetector).init(i18nConfig);

export default i18n;
