"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KEYS } from "@/lib/data";
import Reveal from "./Reveal";
import KeyboardLayer from "./KeyboardLayer";

// Seção do teclado 3D: o canvas é fixo (Keyboard3D); aqui fica o texto à esquerda
// e uma fileira de botões acessíveis que disparam as mesmas teclas.
const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
};

const press = (id: string) => dispatchEvent(new CustomEvent("key-press", { detail: id }));

export default function Skills() {
  const [id, setId] = useState<string | null>(null);
  const sec = useRef<HTMLElement>(null);
  const inView = useRef(false);
  useEffect(() => {
    const on = (e: Event) => setId((e as CustomEvent<string>).detail);
    addEventListener("key-press", on);
    return () => removeEventListener("key-press", on);
  }, []);

  // o teclado físico só responde com a seção na tela: digitar no resto da página não mexe aqui
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      inView.current = e.isIntersecting;
      if (process.env.NODE_ENV !== "production") (window as unknown as Record<string, unknown>).__skillsInView = e.isIntersecting;
    }, { threshold: 0.2 });
    io.observe(sec.current!);
    return () => io.disconnect();
  }, []);

  // teclado físico: a letra digitada acende a primeira tecnologia que começa com ela;
  // setas andam pela lista. Ignora quando o foco está num campo de texto.
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (!inView.current || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || (el as HTMLElement)?.isContentEditable) return;
      const i = KEYS.findIndex((x) => x.id === id);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const step = e.key === "ArrowRight" ? 1 : KEYS.length - 1;
        press(KEYS[i < 0 ? 0 : (i + step) % KEYS.length].id);
        return;
      }
      if (!/^[a-z]$/i.test(e.key)) return;
      const c = e.key.toLowerCase();
      // a partir da tecla atual, para que letras repetidas (j: JavaScript, Java) alternem
      const order = KEYS.slice(i + 1).concat(KEYS.slice(0, i + 1));
      const hit = order.find((x) => x.label.toLowerCase().startsWith(c) || x.id.startsWith(c));
      if (hit) press(hit.id);
    };
    addEventListener("keydown", on);
    return () => removeEventListener("keydown", on);
  }, [id]);

  const k = KEYS.find((x) => x.id === id);

  return (
    <section ref={sec} id="skills" className="relative z-10 overflow-hidden">
      <KeyboardLayer />
      <div className="pointer-events-none relative z-10 mx-auto grid min-h-[150svh] max-w-6xl items-center px-5 pb-[62svh] pt-24 md:min-h-[130svh] md:grid-cols-2 md:px-8">
      <div className="md:sticky md:top-0 md:flex md:min-h-svh md:flex-col md:justify-center md:py-24">
        <Reveal><p className="label">Tech stack</p></Reveal>
        <Reveal delay={0.05}><h2 className="title-xl mt-4 text-[clamp(40px,6vw,84px)]">Skills</h2></Reveal>
        <Reveal delay={0.1}><p className="mt-3 font-mono text-xs text-white/40">(dica: aperte uma tecla — ou digite no seu teclado, setas ← → andam pela lista)</p></Reveal>
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
              <motion.button onClick={() => press(t.id)} whileHover={{ y: -2 }} whileTap={{ y: 2, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 600, damping: 24 }}
                style={{ boxShadow: id === t.id ? `0 2px 0 ${t.color}` : "0 2px 0 rgb(255 255 255 / .08)" }}
                aria-pressed={id === t.id}
                className={`pointer-events-auto rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors ${id === t.id ? "border-white bg-white text-black" : "border-white/10 text-white/50 hover:text-white"}`}>
                {t.label}
              </motion.button>
            </li>
          ))}
        </ul>
      </div>
      </div>
    </section>
  );
}
