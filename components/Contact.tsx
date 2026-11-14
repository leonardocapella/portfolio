"use client";
import { useState } from "react";
import { PROFILE } from "@/lib/data";
import Reveal, { RevealWords } from "./Reveal";

// ponytail: sem backend, o envio abre o app de e-mail com a mensagem pronta.
// Para envio direto, trocar por uma rota /api com Resend ou Formspree (precisa de chave e de deploy).
export default function Contact() {
  const [sent, setSent] = useState(false);
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const subject = `Contato pelo portfólio: ${f.get("nome")}`;
    const body = `${f.get("mensagem")}\n\n${f.get("nome")} · ${f.get("email")}`;
    location.href = `mailto:${PROFILE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };
  const input = "w-full rounded-xl border border-white/10 bg-white/[.03] px-4 py-3 text-sm outline-none transition-colors placeholder:text-white/30 focus:border-white/40";
  const socials = [
    ["LinkedIn", PROFILE.linkedin], ["GitHub", PROFILE.github], ["Instagram", PROFILE.instagram], ["E-mail", `mailto:${PROFILE.email}`],
  ];

  return (
    <section id="contato" className="relative z-10 mx-auto max-w-6xl px-5 py-28 md:px-8 md:py-40">
      <h2 className="title-xl text-[clamp(40px,8vw,120px)]">
        <RevealWords text="Vamos" /><br /><RevealWords text="conversar?" className="text-white/35" delay={0.1} />
      </h2>
      <div className="mt-14 grid gap-6 md:grid-cols-[1.1fr_.9fr]">
        <Reveal>
          <form onSubmit={submit} className="glass rounded-3xl p-6 md:p-8">
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold">Fale comigo</h3>
            <p className="mt-1 text-sm text-white/45">Vaga, projeto ou só uma ideia: me manda uma mensagem.</p>
            <div className="mt-6 grid gap-3">
              <label className="sr-only" htmlFor="nome">Seu nome</label>
              <input id="nome" name="nome" required maxLength={80} placeholder="Seu nome" className={input} />
              <label className="sr-only" htmlFor="email">Seu e-mail</label>
              <input id="email" name="email" type="email" required maxLength={120} placeholder="Seu e-mail" className={input} />
              <label className="sr-only" htmlFor="mensagem">Mensagem</label>
              <textarea id="mensagem" name="mensagem" required maxLength={2000} rows={5} placeholder="Sua mensagem" className={input + " resize-none"} />
              <button className="mt-2 rounded-xl bg-white py-3 text-sm font-medium text-black transition-transform hover:-translate-y-0.5">
                {sent ? "Abrindo seu e-mail…" : "Enviar mensagem →"}
              </button>
            </div>
          </form>
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col gap-4">
          <div className="glass rounded-3xl p-6 md:p-8">
            <p className="label">Contato direto</p>
            <a href={`mailto:${PROFILE.email}`} className="mt-3 block text-[clamp(14px,4.2vw,18px)] [overflow-wrap:anywhere] hover:underline">{PROFILE.email.replace("@", "\u200B@")}</a>
            <p className="mt-2 text-sm text-white/45">{PROFILE.city} · responde em português, inglês ou espanhol</p>
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {socials.map(([n, h]) => (
              <li key={n}>
                <a href={h} {...(h.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="glass flex items-center justify-between rounded-2xl px-5 py-4 text-sm transition-colors hover:border-white/25">
                  <span>{n}{h === "#" && <span className="block font-mono text-[10px] text-white/30">[PLACEHOLDER]</span>}</span>
                  <span className="text-white/40">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
      <footer className="mt-24 flex justify-between border-t border-white/[.07] pt-6 font-mono text-xs text-white/35">
        <span>© 2026 Leonardo Capella</span>
        <span className="flex gap-4"><a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white">LinkedIn ↗</a><span className="hidden sm:inline">feito com Next.js, three.js e GSAP</span></span>
      </footer>
    </section>
  );
}
