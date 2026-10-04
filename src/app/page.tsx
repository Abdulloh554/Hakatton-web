import { locations } from "@hakaton/shared";
import Explorer from "../components/explorer";

export default function HomePage() {
  const username = process.env.TELEGRAM_BOT_USERNAME;
  return <Explorer initialLocations={locations} botUsername={username && /^[A-Za-z0-9_]{5,32}$/.test(username) ? username : undefined} />;
}
