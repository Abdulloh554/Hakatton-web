"use client";

import { Check, Languages, Moon, Settings2, Sun, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";
type Language = "uz" | "en" | "ru";
const languages: { id: Language; label: string; detail: string }[] = [
  { id: "uz", label: "O‘zbekcha", detail: "Lotin" },
  { id: "en", label: "English", detail: "Interface" },
  { id: "ru", label: "Русский", detail: "Интерфейс" },
];

export default function ProfileSettings() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguage] = useState<Language>("uz");
  useEffect(() => {
    const savedTheme = localStorage.getItem("terra-theme") as Theme | null;
    const savedLanguage = localStorage.getItem("terra-language") as Language | null;
    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
    if (savedLanguage === "uz" || savedLanguage === "en" || savedLanguage === "ru") setLanguage(savedLanguage);
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem("terra-theme", theme); }, [theme]);
  useEffect(() => { document.documentElement.lang = language === "uz" ? "uz-Latn" : language; localStorage.setItem("terra-language", language); }, [language]);
  return <>
    <button className="profile-trigger" aria-label="Profil sozlamalari" aria-expanded={open} onClick={() => setOpen(true)}><UserRound size={17}/><Settings2 size={13}/></button>
    {open && <div className="settings-backdrop" role="presentation" onMouseDown={() => setOpen(false)}><section className="settings-sheet" role="dialog" aria-modal="true" aria-label="Profil sozlamalari" onMouseDown={(event) => event.stopPropagation()}><header><div><span className="settings-avatar">TA</span><div><b>Mehmon tadqiqotchi</b><small>Sozlamalar shu qurilmada saqlanadi</small></div></div><button aria-label="Sozlamalarni yopish" onClick={() => setOpen(false)}><X size={18}/></button></header><div className="settings-part"><p><Languages size={15}/> Til</p><div className="language-options">{languages.map((item) => <button className={language === item.id ? "chosen" : ""} key={item.id} onClick={() => setLanguage(item.id)}><span><b>{item.label}</b><small>{item.detail}</small></span>{language === item.id && <Check size={16}/>}</button>)}</div><small className="settings-note">Katalogdagi ilmiy tavsiflar hozir o‘zbek tilida. Tanlangan til navigatsiya va yangi bo‘limlarda qo‘llanadi.</small></div><div className="settings-part"><p>{theme === "dark" ? <Moon size={15}/> : <Sun size={15}/>} Ko‘rinish</p><div className="theme-options"><button className={theme === "light" ? "chosen" : ""} onClick={() => setTheme("light")}><Sun size={17}/> Yorug‘</button><button className={theme === "dark" ? "chosen" : ""} onClick={() => setTheme("dark")}><Moon size={17}/> Tungi</button></div></div></section></div>}
  </>;
}
