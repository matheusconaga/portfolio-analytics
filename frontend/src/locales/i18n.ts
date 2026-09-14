import i18n from "i18next";

import {
  initReactI18next,
} from "react-i18next";

import ptTranslation from "./pt";
import enTranslation from "./en";

const savedLanguage =
  localStorage.getItem(
    "analytics-language",
  );

const browserLanguage =
  navigator.language
    .toLowerCase()
    .startsWith("pt")
    ? "pt"
    : "en";

const initialLanguage =
  savedLanguage === "pt" ||
  savedLanguage === "en"
    ? savedLanguage
    : browserLanguage;

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      pt: {
        translation:
          ptTranslation.get(),
      },

      en: {
        translation:
          enTranslation.get(),
      },
    },

    lng: initialLanguage,

    fallbackLng: "en",

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;