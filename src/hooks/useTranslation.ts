import { useTranslation as useI18nextTranslation, UseTranslationOptions } from 'react-i18next';

export function useTranslation(ns?: string | string[], options?: UseTranslationOptions) {
  return useI18nextTranslation(ns, options);
}
