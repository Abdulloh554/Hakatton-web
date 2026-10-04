"use client";

import { Check, Languages, Moon, Settings2, Sun, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { type AppLanguage, useAppLanguage } from "./language";

type Theme = "light" | "dark";
const languages: { id: AppLanguage; label: string; detail: string }[] = [
  { id: "uz", label: "O‘zbekcha", detail: "Lotin" },
  { id: "en", label: "English", detail: "Interface" },
  { id: "ru", label: "Русский", detail: "Интерфейс" },
];

export default function ProfileSettings() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const { language, setLanguage, t } = useAppLanguage();
  useEffect(() => {
    const savedTheme = localStorage.getItem("terra-theme") as Theme | null;
    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem("terra-theme", theme); }, [theme]);
  return <>
    <button className="profile-trigger" aria-label={t.profile} aria-expanded={open} onClick={() => setOpen(true)}><UserRound size={17}/><Settings2 size={13}/></button>
    {open && <div className="settings-backdrop" role="presentation" onMouseDown={() => setOpen(false)}><section className="settings-sheet" role="dialog" aria-modal="true" aria-label={t.profile} onMouseDown={(event) => event.stopPropagation()}><header><div><span className="settings-avatar">TA</span><div><b>{t.guest}</b><small>{t.device}</small></div></div><button aria-label="Close settings" onClick={() => setOpen(false)}><X size={18}/></button></header><div className="settings-part"><p><Languages size={15}/>{t.language}</p><div className="language-options">{languages.map((item) => <button className={language === item.id ? "chosen" : ""} key={item.id} onClick={() => setLanguage(item.id)}><span><b>{item.label}</b><small>{item.detail}</small></span>{language === item.id && <Check size={16}/>}</button>)}</div><small className="settings-note">{t.note}</small></div><div className="settings-part"><p>{theme === "dark" ? <Moon size={15}/> : <Sun size={15}/>} {t.appearance}</p><div className="theme-options"><button className={theme === "light" ? "chosen" : ""} onClick={() => setTheme("light")}><Sun size={17}/> {t.light}</button><button className={theme === "dark" ? "chosen" : ""} onClick={() => setTheme("dark")}><Moon size={17}/> {t.dark}</button></div></div></section></div>}
  </>;
}
