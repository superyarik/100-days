import { createContext, useContext, useState, useEffect } from 'react';
import * as Localization from 'expo-localization';
import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import en from '@/services/i18n/en-US.json';
import pt from '@/services/i18n/pt-PT.json';
import cn from '@/services/i18n/zh-CN.json';
import es from '@/services/i18n/es-ES.json';
import fr from '@/services/i18n/fr-FR.json';
import de from '@/services/i18n/de-DE.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';

// Set the key-value pairs for the different languages you want to support.
const resources = {
  en,
  pt,
  cn,
  es,
  fr,
  de,
};

const I18nContext = createContext({});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<string | null>();

  const updateLocale = async (locale: string) => {
    await AsyncStorage.setItem('hundred_locale', locale);
    i18next.changeLanguage(locale);
    setLocale(locale);
  };

  useEffect(() => {
    if (locale) return;
    const loadLocales = async () => {
      const storedLocale = await AsyncStorage.getItem('hundred_locale');
      if (storedLocale) {
        setLocale(storedLocale);
      } else {
        const locale = Localization.getLocales()?.[0].languageTag;
        setLocale(locale);
      }
    };
    loadLocales();
  }, [locale]);

  return (
    <I18nContext.Provider
      value={{
        setLocale: async (locale: string) => await updateLocale(locale),
        locale,
      }}
    >
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
