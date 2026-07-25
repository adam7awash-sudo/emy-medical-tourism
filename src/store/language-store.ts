import { create } from "zustand";

type Language = "ar" | "en";

interface LanguageStore {
  lang: Language;
  setLang: (lang: Language) => void;
  isRTL: () => boolean;
  t: (ar: string, en: string) => string;
}

export const useLanguageStore = create<LanguageStore>((set, get) => ({
  lang: "ar",
  setLang: (lang) => {
    set({ lang });
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  },
  isRTL: () => get().lang === "ar",
  t: (ar: string, en: string) => get().lang === "ar" ? ar : en,
}));