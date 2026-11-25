"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CERTS, CREDENTIALS, GROUPS, KEYS, LANGS, PROFILE } from "@/lib/data";
import Reveal, { RevealWords } from "./Reveal";

const TABS = ["Credenciais", "Tech Stack"] as const;
const card = { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

export default function Portfolio() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Credenciais");
  return (
    <section id="portfolio" className="relative z-10 mx-auto max-w-6xl px-5 py-28 md:px-8 md:py-40">
      <div className="text-center">
        <h2 className="title-xl text-[clamp(34px,5.5vw,72px)]"><RevealWords text="Credenciais" /></h2>
        <Reveal delay={0.1}><p className="mx-auto mt-4 max-w-lg text-white/50">Formação, idiomas e as ferramentas que uso no dia a dia.</p></Reveal>
      </div>
      <Reveal delay={0.15}>
        <div role="tablist" className="glass mx-auto mt-10 grid max-w-sm grid-cols-2 gap-1 rounded-2xl p-1.5">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
              className={`relative rounded-xl py-3 text-sm transition-colors ${tab === t ? "text-white" : "text-white/45 hover:text-white/80"}`}>
              {tab === t && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-xl bg-white/[.09] ring-1 ring-white/10" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>
      </Reveal>

      <div className="mt-12 min-h-[400px]">
        <AnimatePresence mode="wait">
          {tab === "Credenciais" && (
            <motion.div key="c" exit={{ opacity: 0 }}>
              <ul className="grid gap-5 sm:grid-cols-3">
                {CERTS.map((c, i) => (
                  <motion.li key={c.title} {...card} transition={{ delay: i * 0.08 }} className="glass rounded-2xl p-5">
                    <p className="label !text-[10px]">Certificado · {c.year}</p>
                    <p className="mt-3 text-sm">{c.title}</p>
                    <p className="mt-1 font-mono text-[11px] text-white/40">{c.org}</p>
                    {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-xs text-white/60 hover:text-white">Verificar ↗</a>}
                  </motion.li>
                ))}
                {CREDENTIALS.map((c, i) => (
                  <motion.li key={c.title} {...card} transition={{ delay: (CERTS.length + i) * 0.08 }} className="glass flex flex-col rounded-2xl p-5">
                    <p className="label !text-[10px]">{c.kind}{c.when && ` · ${c.when}`}</p>
                    <p className="mt-3 font-[family-name:var(--font-display)] text-base font-bold leading-snug">{c.title}</p>
                    <p className="mt-2 text-sm text-white/50">{c.org}</p>
                  </motion.li>
                ))}
              </ul>
              <p className="label mt-12">Idiomas</p>
              <ul className="mt-4 grid gap-5 sm:grid-cols-3">
                {LANGS.map((l, i) => (
                  <motion.li key={l.code} {...card} transition={{ delay: (CERTS.length + CREDENTIALS.length + i) * 0.08 }} whileHover={{ y: -6 }}
                    className="glass group relative overflow-hidden rounded-2xl p-5">
                    <span aria-hidden className="pointer-events-none absolute -right-3 -top-4 font-[family-name:var(--font-display)] text-[76px] font-black leading-none text-white/[0.06] transition-all duration-500 group-hover:-translate-y-1 group-hover:text-white/[0.12]">
                      {l.code}
                    </span>
                    <p className="label !text-[10px]">{l.level}</p>
                    <p className="mt-3 font-[family-name:var(--font-display)] text-base font-bold leading-snug">{l.name}</p>
                    <p className="mt-2 text-sm text-white/50">{l.note}</p>
                  </motion.li>
                ))}
              </ul>
              <motion.a {...card} transition={{ delay: 0.3 }} href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer"
                className="glass mx-auto mt-6 flex max-w-md items-center justify-between rounded-2xl px-5 py-4 text-sm hover:border-white/25">
                <span>Certificados e trajetória completa no LinkedIn</span><span className="text-white/50">↗</span>
              </motion.a>
            </motion.div>
          )}
          {tab === "Tech Stack" && (
            <motion.div key="t" className="mx-auto flex max-w-4xl flex-col gap-10" exit={{ opacity: 0 }}>
              {GROUPS.map((g, gi) => (
              <section key={g}>
              <p className="label mb-4">{g}</p>
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
              {KEYS.filter((k) => k.group === g).map((k, i) => (
                <motion.li key={k.id} {...card} transition={{ delay: gi * 0.08 + i * 0.03 }} whileHover={{ y: -6 }}
                  className="glass flex flex-col items-center gap-3 rounded-2xl py-5">
                  <span className="grid h-12 w-12 place-items-center rounded-xl" style={{ background: k.color }}>
                    {k.icon ? (
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill={k.ink}><path d={k.icon.path} /></svg>
                    ) : <b className="font-[family-name:var(--font-display)] text-sm" style={{ color: k.ink }}>{k.text}</b>}
                  </span>
                  <span className="px-2 text-center text-xs text-white/60">{k.label}</span>
                </motion.li>
              ))}
              </ul>
              </section>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
