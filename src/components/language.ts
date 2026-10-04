"use client";

import { useEffect, useState } from "react";

export type AppLanguage = "uz" | "en" | "ru";

const copy = {
  uz: {
    atlas: "Atlas", compare: "Taqqoslash", quiz: "Quiz", home: "Bosh sahifa",
    profile: "Profil sozlamalari", guest: "Mehmon tadqiqotchi", device: "Sozlamalar shu qurilmada saqlanadi",
    language: "Til", appearance: "Ko‘rinish", light: "Yorug‘", dark: "Tungi",
    note: "Til tanlovi navigatsiya va ilova boshqaruvlariga darhol qo‘llanadi.",
  },
  en: {
    atlas: "Atlas", compare: "Compare", quiz: "Quiz", home: "Home",
    profile: "Profile settings", guest: "Guest researcher", device: "Settings are saved on this device",
    language: "Language", appearance: "Appearance", light: "Light", dark: "Dark",
    note: "Your language choice is applied immediately to navigation and app controls.",
  },
  ru: {
    atlas: "Атлас", compare: "Сравнение", quiz: "Квиз", home: "Главная",
    profile: "Настройки профиля", guest: "Гость-исследователь", device: "Настройки сохранены на этом устройстве",
    language: "Язык", appearance: "Внешний вид", light: "Светлая", dark: "Тёмная",
    note: "Выбранный язык сразу применяется к навигации и элементам управления.",
  },
} as const;

export type Copy = (typeof copy)[AppLanguage];

function savedLanguage(): AppLanguage {
  if (typeof window === "undefined") return "uz";
  const stored = localStorage.getItem("terra-language");
  return stored === "en" || stored === "ru" || stored === "uz" ? stored : "uz";
}

/** One browser-wide source of truth so the profile dialog updates the live UI immediately. */
export function useAppLanguage() {
  const [language, setLanguageState] = useState<AppLanguage>("uz");
  useEffect(() => {
    const sync = () => setLanguageState(savedLanguage());
    sync();
    window.addEventListener("terra-language-change", sync);
    return () => window.removeEventListener("terra-language-change", sync);
  }, []);
  const setLanguage = (next: AppLanguage) => {
    localStorage.setItem("terra-language", next);
    document.documentElement.lang = next === "uz" ? "uz-Latn" : next;
    setLanguageState(next);
    window.dispatchEvent(new Event("terra-language-change"));
  };
  return { language, setLanguage, t: copy[language] };
}
