import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from "@/services/i18n/en-US.json";
import pt from "@/services/i18n/pt-PT.json";
import ru from "@/services/i18n/ru-RU.json";
import zh from "@/services/i18n/zh-CN.json";
import de from "@/services/i18n/de-DE.json";
import es from "@/services/i18n/es-ES.json";
import fr from "@/services/i18n/fr-FR.json";
import hi from "@/services/i18n/hi-IN.json";

const resources = {
    en,
    pt,
    ru,
    zh,
    de,
    es,
    fr,
    hi,
};

const initializeI18n = async (language) => {
    await i18n.use(initReactI18next).init({
        compatibilityJSON: 'v3',
        resources,
        lng: language,
        fallbackLng: 'en',
    });
};

export { i18n, initializeI18n };
