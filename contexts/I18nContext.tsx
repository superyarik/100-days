import { createContext, useContext, useState, useEffect } from 'react';
import * as Localization from 'expo-localization';
import { initReactI18next, useTranslation } from 'react-i18next';
import i18n from 'i18next';
import en from '@/services/i18n/en.json';
import pt from '@/services/i18n/pt.json';

// Set the key-value pairs for the different languages you want to support.
const resources = {
  en,
  pt,
};

const I18nContext = createContext({});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState(Localization.locale);
  const { t } = useTranslation();

  useEffect(() => {
    i18n.use(initReactI18next).init({
      compatibilityJSON: 'v3',
      resources,
      lng: locale,
    });
  }, [locale]);

  return (
    <I18nContext.Provider value={{ i18n, setLocale, locale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// Custom hook to use the i18n context
export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
