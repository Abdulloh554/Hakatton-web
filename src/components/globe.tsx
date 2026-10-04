"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Pause, Play, Plus, RotateCcw } from "lucide-react";
import type { Location } from "@hakaton/shared";
import { createGlobeScene, type GlobeMode, type GlobeScene } from "./globe-scene";

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch { return false; }
}

export function Globe({ locations, selectedId, mode, onSelect }: { locations: Location[]; selectedId: string; mode: GlobeMode; onSelect: (id: string) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<GlobeScene | null>(null);
  const [fallback, setFallback] = useState(false);
  const [playing, setPlaying] = useState(true);
  const onSelectRef = useRef(onSelect);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => {
    if (!host.current || !supportsWebGL()) { setFallback(true); return; }
    let disposed = false;
    try {
      const next = createGlobeScene(host.current, {
        onSelect: (id) => onSelectRef.current(id),
        onInteraction: () => setPlaying(false),
        onHover: () => undefined,
        onUnavailable: () => setFallback(true),
        onTextureError: () => undefined,
      });
      if (disposed) next.dispose(); else scene.current = next;
    } catch { setFallback(true); }
    return () => { disposed = true; scene.current?.dispose(); scene.current = null; };
  }, []);
  useEffect(() => { scene.current?.update(locations, selectedId, mode); }, [locations, selectedId, mode]);
  const rotate = () => { const next = !playing; setPlaying(next); scene.current?.rotate(next); };
  if (fallback) return <div className="globe-area"><div className="globe-fallback"><p>3D globus bu qurilmada ishga tushmadi.</p><div>{locations.map((location) => <button key={location.id} className={location.id === selectedId ? "active" : ""} onClick={() => onSelect(location.id)}>{location.name}<small>{location.lat.toFixed(1)}°, {location.lng.toFixed(1)}°</small></button>)}</div></div></div>;
  return <div className="globe-area"><div ref={host} className="globe-stage" aria-label="Interaktiv 3D Yer globusi"/><div className="globe-controls" aria-label="Globus boshqaruvlari"><button aria-label="Kichraytirish" onClick={() => scene.current?.zoom("out")}><Minus size={16}/></button><button aria-label={playing ? "Aylanishni to‘xtatish" : "Aylanishni boshlash"} className={playing ? "active" : ""} onClick={rotate}>{playing ? <Pause size={15}/> : <Play size={15}/>}</button><button aria-label="Kattalashtirish" onClick={() => scene.current?.zoom("in")}><Plus size={16}/></button><button aria-label="Boshlang‘ich ko‘rinish" onClick={() => { scene.current?.reset(); setPlaying(false); }}><RotateCcw size={15}/></button></div><p className="globe-hint">Aylantiring, yaqinlashtiring yoki yorqin belgilardan birini tanlang.</p></div>;
}
