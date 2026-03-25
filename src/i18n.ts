import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonES from './locales/es/common.json';
import homeES from './locales/es/home.json';
import analysisES from './locales/es/analysis.json';
import promptsES from './locales/es/prompts.json';

import commonEN from './locales/en/common.json';
import homeEN from './locales/en/home.json';
import analysisEN from './locales/en/analysis.json';
import promptsEN from './locales/en/prompts.json';

const resources = {
  es: {
    translation: {
      ...commonES,
      home: homeES,
      analysis: analysisES,
      prompts: promptsES,
    },
  },
  en: {
    translation: {
      ...commonEN,
      home: homeEN,
      analysis: analysisEN,
      prompts: promptsEN,
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['es', 'en'],
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
