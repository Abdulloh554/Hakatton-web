"use client";

import { ArrowRight, Telescope, X } from "lucide-react";
import type { Location } from "@hakaton/shared";
import { formatCoordinates, targetClass, targetLabel } from "../lib/catalog";

export function CompareSection({ items, onRemove }: { items: Location[]; onRemove: (id: string) => void }) {
  const empty = items.length === 0;
  const waiting = items.length === 1;
  return (
    <section className="compare-section" id="compare" aria-labelledby="compare-title">
      <div>
        <p className="eyebrow"><span /> Taqqoslash stoli</p>
        <h2 id="compare-title">Ikki hududni yonma-yon <em>o‘rganing.</em></h2>
        <p>
          Taqqoslash uchun atlasdan ikki joy tanlang. Bu usul o‘xshashlik bilan farqni birga
          ko‘rishga yordam beradi.
        </p>
      </div>
      <div className="compare-grid">
        {items.map((item) => (
          <article key={item.id}>
            <button type="button" aria-label={`${item.name}ni taqqoslashdan olib tashlash`} onClick={() => onRemove(item.id)}>
              <X size={15} />
            </button>
            <span className={`dot ${targetClass(item.target)}`} />
            <h3>{item.name}</h3>
            <p>{item.country} · {formatCoordinates(item.lat, item.lng)}</p>
            <dl>
              <div><dt>Manzil</dt><dd>{targetLabel(item.target)}</dd></div>
              <div><dt>Relyef</dt><dd>{item.terrain}</dd></div>
              <div><dt>Belgilar</dt><dd>{item.features.slice(0, 2).join(", ")}</dd></div>
              <div><dt>Chegara</dt><dd>{item.limitation}</dd></div>
            </dl>
          </article>
        ))}
        {empty && (
          <div className="compare-empty">
            <Telescope size={26} />
            <p>Atlasdan joy tanlang.</p>
          </div>
        )}
        {waiting && (
          <div className="compare-empty">
            <span>02</span>
            <p>Yana bir joy tanlang.</p>
            <a className="text-button" href="#atlas">Atlasga qaytish <ArrowRight size={14} /></a>
          </div>
        )}
      </div>
    </section>
  );
}