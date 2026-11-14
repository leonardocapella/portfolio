"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Lanyard = dynamic(() => import("./Lanyard"), { ssr: false });
const WORDS = ["Automação de processos", "IA aplicada a negócios", "Dados, SQL & dashboards", "CRM & integrações"];

export default function Hero() {
  const [w, setW] = useState(0);
  const [txt, setTxt] = useState("");
  // efeito de digitação
  useEffect(() => {
    const word = WORDS[w % WORDS.length];
    if (txt === word) { const t = setTimeout(() => { setTxt(""); setW((x) => x + 1); }, 1800); return () => clearTimeout(t); }
    const t = setTimeout(() => setTxt(word.slice(0, txt.length + 1)), 55);
    return () => clearTimeout(t);
  }, [txt, w]);

  const up = (d: number) => ({ initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.9, ease: [0.16, 1, 0.3, 1] as const } });

  return (
    <section id="inicio" className="relative mx-auto grid min-h-svh max-w-6xl items-center gap-6 px-5 pt-28 md:grid-cols-[1.15fr_.85fr] md:px-8">
      <div className="relative z-10 min-w-0">
        <motion.p {...up(0.1)} className="label flex items-center gap-2 !text-white/70">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative h-2 w-2 rounded-full bg-emerald-400" /></span>
          Aberto a oportunidades júnior
        </motion.p>
        <motion.h1 {...up(0.2)} className="title-xl mt-6 text-[clamp(34px,6vw,80px)]">
          Analista de<br />Dados <span className="text-white/35">&amp;</span><br /><span className="text-white/35">Automações</span>
        </motion.h1>
        <motion.p {...up(0.3)} className="mt-6 font-mono text-sm text-white/80 md:text-base">
          <span className="caret">{txt}</span>
        </motion.p>
        <motion.p {...up(0.4)} className="mt-5 max-w-md text-[15px] leading-relaxed text-white/55">
          Sou o Leonardo, estudante de Ciência da Computação na UniRitter e trabalho com TI/CRM, automação e IA na V4 Company. Pego planilha, PDF e retrabalho e transformo em sistema que roda sozinho.
        </motion.p>
        <motion.ul {...up(0.5)} className="mt-6 flex flex-wrap gap-2">
          {["Python", "SQL", "Supabase", "JavaScript"].map((t) => (
            <li key={t} className="rounded-md border border-white/10 px-3 py-1 font-mono text-xs text-white/60">{t}</li>
          ))}
        </motion.ul>
        <motion.div {...up(0.6)} className="mt-8 font-mono text-xs leading-6 text-white/40">
          <p>→ Porto Alegre, RS</p>
          <p>→ Analista de Dados / Automações Júnior</p>
        </motion.div>
      </div>
      <div className="relative h-[520px] min-w-0 md:h-svh md:self-start" data-hot>
        <Lanyard />
      </div>
      <motion.a href="#sobre" {...up(1)} className="label absolute bottom-6 left-1/2 -translate-x-1/2">role ↓</motion.a>
    </section>
  );
}
