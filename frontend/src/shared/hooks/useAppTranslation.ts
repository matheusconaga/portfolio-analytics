import {
  useTranslation,
} from "react-i18next";

export type AppLanguage =
  | "pt"
  | "en";

export function useAppTranslation() {
  const {
    t,
    i18n,
  } = useTranslation();

  const language: AppLanguage =
    i18n.language
      .toLowerCase()
      .startsWith("pt")
      ? "pt"
      : "en";

  const changeLanguage =
    async (
      newLanguage: AppLanguage,
    ) => {
      localStorage.setItem(
        "analytics-language",
        newLanguage,
      );

      await i18n.changeLanguage(
        newLanguage,
      );
    };

  return {
    t,
    i18n,
    language,
    changeLanguage,
  };
}