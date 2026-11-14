"use client";
import Image from "next/image";
import { asset } from "@/lib/base";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import Reveal, { RevealWords } from "./Reveal";
import TransitionLink from "./TransitionLink";
import { PROFILE, PROJECTS } from "@/lib/data";

function Count({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const v = useMotionValue(0);
  const s = useSpring(v, { duration: 1800, bounce: 0 });
  const r = useTransform(s, (x) => Math.round(x).toLocaleString("pt-BR"));
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && v.set(to), { threshold: 0.6 });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, [to, v]);
  return <motion.span ref={ref}>{r}</motion.span>;
}

const STATS = [
  { icon: "</>", n: PROJECTS.length, label: "Projetos", href: "/#portfolio" },
  { icon: "◎", n: 2, label: "Idiomas além do português", href: "/#portfolio" },
  { icon: "⌘", n: 413, label: "Checks automáticos antes de cada SQL", href: "/projetos/hub-v4" },
];

export default function About() {
  return (
    <section id="sobre" className="relative z-10 mx-auto max-w-6xl px-5 py-28 md:px-8 md:py-40">
      <Reveal><p className="label">Sobre mim</p></Reveal>
      <div className="mt-6 grid items-center gap-12 md:grid-cols-[1.3fr_.7fr]">
        <div>
          <h2 className="title-xl text-[clamp(36px,6vw,80px)]">
            <RevealWords text="Leonardo" /><br /><RevealWords text="Capella" className="text-white/35" delay={0.1} />
          </h2>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-xl leading-relaxed text-white/60">
              Tenho 19 anos, estudo Ciência da Computação na UniRitter (Campus FAPA, Porto Alegre) e, desde junho de 2026, sou estagiário de TI e CRM na V4 Company Mendes &amp; Santos. Lá eu crio automações de CRM, integro sistemas e coloco IA dentro dos processos comerciais. Meu objetivo é atuar como desenvolvedor fullstack. Falo inglês e espanhol em nível avançado.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <blockquote className="glass mt-8 inline-block rounded-xl px-5 py-3 text-sm italic text-white/70">
              “Se eu faço uma coisa à mão duas vezes, na terceira já virou script.”
            </blockquote>
          </Reveal>
          <Reveal delay={0.3} className="mt-8 flex flex-wrap gap-3">
            <a href={asset(PROFILE.cv)} download className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition-transform hover:-translate-y-0.5">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12m0 0-5-5m5 5 5-5M4 21h16" /></svg>
              Baixar CV
            </a>
            <TransitionLink href="/#portfolio" className="glass inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm transition-transform hover:-translate-y-0.5">↗ Ver projetos</TransitionLink>
          </Reveal>
        </div>
        <Reveal delay={0.2} className="mx-auto w-full max-w-[320px]">
          <motion.div whileHover={{ rotate: -2, scale: 1.02 }} className="relative aspect-square">
            <div className="absolute -inset-3 rounded-full border border-white/10" />
            <Image src={asset(PROFILE.photo)} alt="Retrato de Leonardo Capella" fill sizes="320px" className="rounded-full object-cover object-[50%_30%] grayscale-[.15]" />
          </motion.div>
        </Reveal>
      </div>
      <div className="mt-20 grid gap-4 md:grid-cols-3">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <TransitionLink href={s.href} className="glass group flex items-end justify-between rounded-2xl p-6 transition-colors hover:border-white/25">
              <div>
                <span className="grid h-10 w-10 place-items-center rounded-full border border-white/10 font-mono text-sm">{s.icon}</span>
                <p className="label mt-6">{s.label}</p>
              </div>
              <div className="text-right">
                <p className="title-xl text-4xl"><Count to={s.n} /></p>
                <span className="mt-2 inline-block text-white/40 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">↗</span>
              </div>
            </TransitionLink>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
