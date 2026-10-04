"use client";

import { Bookmark, CircleOff, ExternalLink, MapPin, Search, Share2, Sparkles, Check } from "lucide-react";
import type { Location } from "@hakaton/shared";
import { Globe } from "./globe";
import type { GlobeMode } from "./globe-scene";
import { formatCoordinates, targetClass, targetLabel } from "../lib/catalog";

export const TARGET_FILTERS = ["Barchasi", "Mars", "Oy", "Ikkalasi"] as const;
export type TargetFilter = (typeof TARGET_FILTERS)[number];
export type ScopeFilter = "all" | "saved";

export function globeModeFor(filter: TargetFilter): GlobeMode {
  if (filter === "Mars") return "mars";
  if (filter === "Oy") return "moon";
  return "earth";
}

export function AtlasSection({
  locations,
  visible,
  selected,
  filteredOut,
  terrains,
  target,
  terrain,
  query,
  scope,
  savedIds,
  compareIds,
  compareReady,
  onTarget,
  onTerrain,
  onQuery,
  onScope,
  onSelect,
  onToggleSave,
  onToggleCompare,
  onShare,
  onResetFilters,
}: {
  locations: Location[];
  visible: Location[];
  selected: Location | undefined;
  filteredOut: boolean;
  terrains: string[];
  target: TargetFilter;
  terrain: string;
  query: string;
  scope: ScopeFilter;
  savedIds: string[];
  compareIds: string[];
  compareReady: boolean;
  onTarget: (value: TargetFilter) => void;
  onTerrain: (value: string) => void;
  onQuery: (value: string) => void;
  onScope: (value: ScopeFilter) => void;
  onSelect: (id: string) => void;
  onToggleSave: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onShare: (id: string) => void;
  onResetFilters: () => void;
}) {
  return (
    <section className="atlas-section" id="atlas">
      <div className="section-title">
        <div>
          <p className="eyebrow"><span /> Atlas / real koordinatalar</p>
          <h2>Qaysi joy qaysi<br /><em>olamga yaqin?</em></h2>
        </div>
        <p>
          Globusni aylantiring, nuqtani tanlang yoki qidiruv orqali joy toping. Belgilar haqiqiy
          koordinata bilan joylashtirilgan.
        </p>
      </div>
      <div className="atlas-shell">
        <aside className="atlas-filters">
          <label className="search">
            <Search size={17} />
            <input
              aria-label="Lokatsiya qidirish"
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              placeholder="Joy, davlat yoki belgi"
            />
          </label>
          <div className="chip-row" role="group" aria-label="Kosmik manzil filtri">
            {TARGET_FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                className={target === item ? "active" : ""}
                aria-pressed={target === item}
                onClick={() => onTarget(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="select-wrap">
            <span>Relyef turi</span>
            <select value={terrain} onChange={(event) => onTerrain(event.target.value)}>
              {terrains.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <div className="chip-row scope-row" role="group" aria-label="Ro‘yxat turi">
            <button type="button" className={scope === "all" ? "active" : ""} aria-pressed={scope === "all"} onClick={() => onScope("all")}>
              Barchasi
            </button>
            <button type="button" className={scope === "saved" ? "active" : ""} aria-pressed={scope === "saved"} onClick={() => onScope("saved")}>
              Saqlangan{savedIds.length ? ` (${savedIds.length})` : ""}
            </button>
          </div>
          <p className="result-count" role="status">
            {visible.length} joy topildi
            {scope === "saved" ? " (saqlanganlar)" : ""}
          </p>
          <div className="location-list">
            {visible.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`location-row ${selected?.id === item.id ? "selected" : ""}`}
                aria-current={selected?.id === item.id}
                onClick={() => onSelect(item.id)}
              >
                <span className={`dot ${targetClass(item.target)}`} />
                <span>
                  <b>{item.name}</b>
                  <small>{item.country} · {targetLabel(item.target)}</small>
                </span>
                <Bookmark
                  size={14}
                  className={savedIds.includes(item.id) ? "row-saved" : ""}
                  fill={savedIds.includes(item.id) ? "currentColor" : "none"}
                />
              </button>
            ))}
            {!visible.length && (
              <div className="empty-state">
                <CircleOff size={18} />
                <p>
                  {scope === "saved"
                    ? "Hali saqlangan joy yo‘q. Atlasdagi joylardan birini saqlang."
                    : "Mos joy topilmadi. Qidiruv yoki filterni o‘zgartiring."}
                </p>
                <button type="button" className="text-button" onClick={onResetFilters}>Filtrni tozalash</button>
              </div>
            )}
          </div>
          <p className="catalog-total">Katalogda {locations.length} ta tasdiqlangan hudud bor.</p>
        </aside>
        <Globe locations={visible} selectedId={selected?.id ?? ""} mode={globeModeFor(target)} onSelect={onSelect} />
        {selected && (
          <article className="location-detail">
            <div className="detail-top">
              <span className={`target-badge ${targetClass(selected.target)}`}>{targetLabel(selected.target)} analogi</span>
              <div className="detail-actions">
                <button
                  type="button"
                  className="icon-button"
                  aria-label={savedIds.includes(selected.id) ? "Joyni saqlashdan olib tashlash" : "Joyni saqlash"}
                  aria-pressed={savedIds.includes(selected.id)}
                  onClick={() => onToggleSave(selected.id)}
                >
                  <Bookmark size={18} fill={savedIds.includes(selected.id) ? "currentColor" : "none"} />
                </button>
                <button type="button" className="icon-button" aria-label="Joy havolasini nusxalash" onClick={() => onShare(selected.id)}>
                  <Share2 size={17} />
                </button>
              </div>
            </div>
            <h3>{selected.name}</h3>
            <p className="location-place"><MapPin size={14} />{selected.country} · {formatCoordinates(selected.lat, selected.lng)}</p>
            <p className="summary">{selected.summary}</p>
            {filteredOut && (
              <p className="filter-warning">
                Bu joy joriy qidiruv va filtrga mos kelmaydi, shuning uchun globusda ko‘rinmaydi.{" "}
                <button type="button" className="text-button" onClick={onResetFilters}>Filtrni tozalash</button>
              </p>
            )}
            <dl>
              <div>
                <dt>Nima o‘xshaydi?</dt>
                <dd>{selected.explanation}</dd>
              </div>
              <div>
                <dt>Farqi nimada?</dt>
                <dd>{selected.limitation}</dd>
              </div>
            </dl>
            <div className="tag-list">
              {selected.features.map((feature) => <span key={feature}>{feature}</span>)}
            </div>
            <button
              type="button"
              className={`compare-button ${compareIds.includes(selected.id) ? "selected" : ""}`}
              aria-pressed={compareIds.includes(selected.id)}
              onClick={() => onToggleCompare(selected.id)}
            >
              {compareIds.includes(selected.id) ? <Check size={16} /> : <Sparkles size={16} />}
              {compareIds.includes(selected.id) ? "Taqqoslashga qo‘shildi" : "Taqqoslashga qo‘shish"}
            </button>
            <details>
              <summary>Ilmiy manbalar <ExternalLink size={13} /></summary>
              <ul>
                {selected.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
                  </li>
                ))}
              </ul>
            </details>
            <p className="detail-hint">
              {compareReady ? "Ikki joy tanlangan — taqqoslash stoliga o‘ting." : "Taqqoslash uchun yana bir joy tanlang."}
            </p>
          </article>
        )}
      </div>
    </section>
  );
}