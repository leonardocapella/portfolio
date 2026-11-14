"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KEYS } from "@/lib/data";
import Reveal from "./Reveal";

// Seção do teclado 3D: o canvas é fixo (Keyboard3D); aqui fica o texto à esquerda
// e uma fileira de botões acessíveis que disparam as mesmas teclas.
const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
};

export default function Skills() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    const on = (e: Event) => setId((e as CustomEvent<string>).detail);
    addEventListener("key-press", on);
    return () => removeEventListener("key-press", on);
  }, []);
  const k = KEYS.find((x) => x.id === id);

  return (
    <section id="skills" className="relative z-10 mx-auto grid min-h-[150svh] md:min-h-[130svh] max-w-6xl items-center px-5 md:grid-cols-2 md:px-8">
      <div className="pb-[62svh] pt-24 md:sticky md:py-24 md:top-0 md:flex md:min-h-svh md:flex-col md:justify-center">
        <Reveal><p className="label">Tech stack</p></Reveal>
        <Reveal delay={0.05}><h2 className="title-xl mt-4 text-[clamp(40px,6vw,84px)]">Skills</h2></Reveal>
        <Reveal delay={0.1}><p className="mt-3 font-mono text-xs text-white/40">(dica: aperte uma tecla)</p></Reveal>
        <div className="mt-10 min-h-[170px]" aria-live="polite">
          <AnimatePresence mode="wait">
            {k ? (
              <motion.div key={k.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}>
                <p className="title-xl text-[clamp(32px,4.5vw,58px)]" style={{ color: lum(k.color) < 0.25 ? k.ink : k.color }}>{k.label}</p>
                <p className="mt-3 max-w-sm text-lg leading-snug text-white/75">{k.phrase}</p>
              </motion.div>
            ) : (
              <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-sm text-white/45">
                Cada tecla é uma tecnologia que eu uso. Clique em uma no teclado ou na lista abaixo.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <ul className="mt-6 flex max-w-md flex-wrap gap-1.5">
          {KEYS.map((t) => (
            <li key={t.id}>
              <button onClick={() => dispatchEvent(new CustomEvent("key-press", { detail: t.id }))}
                className={`rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors ${id === t.id ? "border-white bg-white text-black" : "border-white/10 text-white/50 hover:text-white"}`}>
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
