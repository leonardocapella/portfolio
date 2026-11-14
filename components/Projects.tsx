"use client";
import { motion } from "framer-motion";
import { PROJECTS } from "@/lib/data";
import ProjectDemo from "./demos/ProjectDemo";
import Reveal, { RevealWords } from "./Reveal";
import TransitionLink from "./TransitionLink";

const ease = [0.16, 1, 0.3, 1] as const;

// Seção dedicada: um projeto por bloco, layout alternado, demo animada + problema/solução/stack/resultado.
export default function Projects() {
  return (
    <section id="projetos" className="relative z-10 mx-auto max-w-6xl px-5 py-28 md:px-8 md:py-40">
      <Reveal><p className="label">O que eu construí</p></Reveal>
      <h2 className="title-xl mt-4 text-[clamp(40px,7vw,96px)]">
        <RevealWords text="Projetos" />
      </h2>
      <Reveal delay={0.1}>
        <p className="mt-5 max-w-xl text-white/50">
          Problemas reais do dia a dia, resolvidos com código. Sites públicos aparecem com print real e link. As ferramentas internas aparecem como demos ilustrativas, com dados fictícios.
        </p>
      </Reveal>

      <ol className="mt-20 flex flex-col gap-28 md:gap-40">
        {PROJECTS.map((p, i) => {
          const flip = i % 2 === 1;
          return (
            <li key={p.slug} className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16 [&>*]:min-w-0">
              <motion.div className={flip ? "md:order-2" : ""}
                initial={{ opacity: 0, y: 60, rotate: flip ? 2 : -2, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                transition={{ duration: 1, ease }}>
                <ProjectDemo p={p} />
              </motion.div>

              <div>
                <Reveal>
                  <div className="flex items-baseline gap-4">
                    <span className="title-xl text-5xl text-white/10 md:text-7xl">{String(i + 1).padStart(2, "0")}</span>
                    <p className="label" style={{ color: p.color }}>{p.tag}</p>
                  </div>
                  <h3 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(26px,3.2vw,40px)] font-bold leading-tight">{p.title}</h3>
                </Reveal>
                <dl className="mt-6 space-y-4 text-[15px] leading-relaxed">
                  {([["Problema", p.problem], ["Solução", p.solution], ["Resultado", p.result]] as const).map(([k, v], j) => (
                    <Reveal key={k} delay={0.08 * (j + 1)}>
                      <dt className="label !text-[10px]">{k}</dt>
                      <dd className={`mt-1 ${k === "Resultado" ? "text-white/85" : "text-white/55"}`}>{v}</dd>
                    </Reveal>
                  ))}
                </dl>
                <Reveal delay={0.32}>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {p.tech.map((t) => <li key={t} className="rounded-md border border-white/10 px-2.5 py-1 font-mono text-[11px] text-white/60">{t}</li>)}
                  </ul>
                  <TransitionLink href={`/projetos/${p.slug}`} className="group mt-7 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
                    Ver detalhes <span className="transition-transform group-hover:translate-x-1">→</span>
                  </TransitionLink>
                </Reveal>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
