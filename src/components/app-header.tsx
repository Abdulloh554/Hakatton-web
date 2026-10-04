import { Compass, House, Send } from "lucide-react";
import ProfileSettings from "./profile-settings";

const LANDING_URL = process.env.NEXT_PUBLIC_LANDING_URL || "http://localhost:3100";

/** Slim chrome for the atlas app: navigation only, the marketing hero lives in the landing app. */
export function AppHeader({ botUsername }: { botUsername?: string }) {
  return (
    <header className="topbar app-topbar">
      <a className="brand" href="#atlas">
        <span className="brand-mark">
          <Compass size={19} />
        </span>
        <span>
          TERRA
          <br />
          <b>ANALOG</b>
        </span>
      </a>
      <nav aria-label="Ilova bo‘limlari">
        <a href="#atlas">Atlas</a>
        <a href="#compare">Taqqoslash</a>
        <a href="#quiz">Quiz</a>
      </nav>
      <div className="topbar-actions">
        <a className="text-link" href={LANDING_URL}>
          <House size={15} /> Bosh sahifa
        </a>
        {botUsername ? (
          <a className="bot-link" href={`https://t.me/${botUsername}`} target="_blank" rel="noreferrer">
            <Send size={15} /> Telegram bot
          </a>
        ) : null}
        <ProfileSettings />
      </div>
    </header>
  );
}
