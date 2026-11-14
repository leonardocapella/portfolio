import { Suspense } from "react";
import { notFound } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";
import Reveal from "@/components/Reveal";
import { PROJECTS } from "@/lib/data";
import ProjectDemo from "@/components/demos/ProjectDemo";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projetos/[slug]">) {
  const { slug } = await params;
  const p = PROJECTS.find((x) => x.slug === slug);
  return { title: p ? `${p.title} · Leonardo Capella` : "Projeto" };
}

export default function Page({ params }: PageProps<"/projetos/[slug]">) {
  return (
    <Suspense fallback={<main className="min-h-svh" />}>
      <Projeto params={params} />
    </Suspense>
  );
}

async function Projeto({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = PROJECTS.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const p = PROJECTS[i], next = PROJECTS[(i + 1) % PROJECTS.length];

  return (
    <>
      <div className="blueprint" /><div className="vignette" />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-32 md:px-8">
        <TransitionLink href="/#portfolio" className="label inline-flex items-center gap-2 hover:!text-white">← Voltar</TransitionLink>
        <div className="mt-8 grid gap-10 md:grid-cols-[1.2fr_.8fr]">
          <div>
            <Reveal><p className="label" style={{ color: p.color }}>{p.tag}</p></Reveal>
            <Reveal delay={0.05}><h1 className="title-xl mt-4 text-[clamp(36px,6vw,76px)]">{p.title}</h1></Reveal>
            {p.long.map((t, k) => (
              <Reveal key={k} delay={0.1 + k * 0.05}><p className="mt-6 max-w-2xl leading-relaxed text-white/60">{t}</p></Reveal>
            ))}
            <Reveal delay={0.25} className="mt-10 grid grid-cols-2 gap-3 sm:max-w-md">
              <div className="glass rounded-2xl p-4"><p className="title-xl text-2xl">{p.tech.length}</p><p className="label mt-1 !text-[10px]">tecnologias</p></div>
              <div className="glass rounded-2xl p-4"><p className="title-xl text-2xl">{p.features.length}</p><p className="label mt-1 !text-[10px]">destaques</p></div>
            </Reveal>
          </div>
          <div className="flex flex-col gap-4">
            <Reveal delay={0.1}>
              <ProjectDemo p={p} />
              <p className="mt-2 font-mono text-[10px] text-white/30">{p.image ? "print real do site" : "demo ilustrativa · dados fictícios"}</p>
            </Reveal>
            <Reveal delay={0.15} className="glass rounded-2xl p-5">
              <p className="label">Destaques</p>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                {p.features.map((f) => <li key={f} className="flex gap-2"><span style={{ color: p.color }}>✦</span>{f}</li>)}
              </ul>
            </Reveal>
            <Reveal delay={0.2} className="glass rounded-2xl p-5">
              <p className="label">Tecnologias</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {p.tech.map((t) => <li key={t} className="rounded-md border border-white/10 px-2.5 py-1 font-mono text-xs text-white/60">{t}</li>)}
              </ul>
            </Reveal>
          </div>
        </div>
        <TransitionLink href={`/projetos/${next.slug}`} className="glass group mt-20 flex items-center justify-between rounded-2xl p-6 hover:border-white/25">
          <span><span className="label">Próximo projeto</span><span className="mt-2 block font-[family-name:var(--font-display)] text-2xl font-bold">{next.title}</span></span>
          <span className="text-2xl transition-transform group-hover:translate-x-2">→</span>
        </TransitionLink>
      </main>
    </>
  );
}
