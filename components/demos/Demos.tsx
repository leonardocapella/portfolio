"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";

// Demos ilustrativas de cada projeto. Dados fictícios e genéricos: nada de cliente real.

// Avança um contador só enquanto a demo está na tela.
function useTicker(ms: number, n: number) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { margin: "-10% 0px" });
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), ms);
    return () => clearInterval(t);
  }, [on, ms, n]);
  return { ref, i, on };
}

export function Window({ title, children, color, href }: { title: string; children: ReactNode; color: string; href?: string }) {
  return (
    <div className="glass group overflow-hidden rounded-2xl shadow-[0_40px_120px_-40px_rgba(0,0,0,.9)]">
      <div className="flex items-center gap-1.5 border-b border-white/[.07] px-4 py-3">
        <i className="h-2.5 w-2.5 shrink-0 rounded-full bg-white/15" /><i className="h-2.5 w-2.5 shrink-0 rounded-full bg-white/15" /><i className="h-2.5 w-2.5 shrink-0 rounded-full bg-white/15" />
        <span className="ml-3 min-w-0 truncate font-mono text-[11px] text-white/40">{title}</span>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="ml-auto shrink-0 whitespace-nowrap rounded-md border border-white/10 px-2 py-0.5 font-mono text-[10px] text-white/60 hover:text-white">abrir site ↗</a>
        ) : (
          <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 12px ${color}` }} />
        )}
      </div>
      <div className="relative aspect-[16/11] overflow-hidden p-4 sm:p-5"
        style={{ background: `radial-gradient(90% 90% at 100% 0%, ${color}1f, transparent 60%)` }}>
        {children}
      </div>
    </div>
  );
}

/* 1. Hub: PDFs viram linhas vinculadas no painel */
export function HubDemo({ c }: { c: string }) {
  const { ref, i } = useTicker(900, 6);
  const rows = ["Cliente A", "Cliente B", "Cliente C", "Cliente D"];
  return (
    <div ref={ref} className="grid h-full grid-cols-[.9fr_2fr] gap-3 text-[11px]">
      <div className="flex flex-col gap-2 rounded-xl border border-white/[.07] bg-black/30 p-2.5">
        <p className="label !text-[9px]">contratos.pdf</p>
        {[0, 1, 2, 3].map((k) => (
          <motion.div key={k} className="flex items-center gap-2 rounded-md border border-white/10 px-2 py-1.5"
            animate={{ opacity: k < i ? 0.25 : 1, x: k < i ? 8 : 0 }}>
            <span className="rounded bg-red-500/80 px-1 font-mono text-[8px] font-bold">PDF</span>
            <span className="h-1.5 flex-1 rounded bg-white/15" />
          </motion.div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-2">
          {["Clientes", "Contratos", "Horas"].map((l, k) => (
            <div key={l} className="rounded-xl border border-white/[.07] bg-black/30 p-2">
              <p className="text-[9px] text-white/40">{l}</p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded bg-white/10">
                <motion.div className="h-full rounded" style={{ background: c }} animate={{ width: `${30 + ((i + k * 2) % 6) * 12}%` }} transition={{ duration: 0.6 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 rounded-xl border border-white/[.07] bg-black/30 p-2.5">
          {rows.map((r, k) => (
            <div key={r} className="flex items-center justify-between border-b border-white/[.05] py-1.5 last:border-0">
              <span className="text-white/70">{r}</span>
              <AnimatePresence mode="wait">
                {k < i ? (
                  <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} className="rounded-full px-2 py-0.5 font-mono text-[9px] text-black" style={{ background: c }}>vinculado ✓</motion.span>
                ) : (
                  <motion.span key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-[9px] text-white/30">aguardando…</motion.span>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* 2. Cobrança: marcador percorre a régua e a mensagem da etapa aparece */
export function CobrancaDemo({ c }: { c: string }) {
  const steps = ["D-5", "D0", "D+3", "D+10", "D+26"];
  const msgs = [
    "Olá! Passando para lembrar que sua fatura vence em 5 dias.",
    "Olá! Sua fatura vence hoje. Segue o link de pagamento.",
    "Olá! Notamos que a fatura ainda está em aberto. Posso ajudar?",
    "Olá! A fatura segue em aberto. Vamos combinar uma data?",
    "Olá! Precisamos regularizar a fatura em aberto. Podemos falar hoje?",
  ];
  const { ref, i } = useTicker(1800, steps.length);
  return (
    <div ref={ref} className="flex h-full flex-col justify-between">
      <div className="relative mt-4 px-2">
        <div className="absolute left-2 right-2 top-[9px] h-px bg-white/15" />
        <motion.div className="absolute left-2 top-[9px] h-px" style={{ background: c }} animate={{ width: `calc(${(i / (steps.length - 1)) * 100}% - ${i === steps.length - 1 ? 16 : 0}px)` }} transition={{ duration: 0.8 }} />
        <div className="relative flex justify-between">
          {steps.map((s, k) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <motion.span className="h-[18px] w-[18px] rounded-full border-2" animate={{ backgroundColor: k <= i ? c : "#0f0f10", borderColor: k <= i ? c : "rgba(255,255,255,.2)", scale: k === i ? 1.25 : 1 }} />
              <span className={`font-mono text-[10px] ${k === i ? "text-white" : "text-white/35"}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-white/[.07] bg-black/30 p-3">
        <p className="label !text-[9px]">mensagem da etapa · {steps[i]}</p>
        <AnimatePresence mode="wait">
          <motion.p key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mt-2 max-w-[85%] rounded-2xl rounded-tl-sm bg-white/[.08] px-3 py-2 text-[12px] text-white/85">
            {msgs[i]}
          </motion.p>
        </AnimatePresence>
        <div className="mt-3 flex gap-2">
          <span className="rounded-md px-2.5 py-1 text-[10px] font-medium text-black" style={{ background: c }}>Copiar</span>
          <span className="rounded-md border border-white/10 px-2.5 py-1 text-[10px] text-white/50">Revisar</span>
        </div>
      </div>
    </div>
  );
}

/* 3. Discadora: fila de ligações; caixa postal desliga sozinha */
export function DiscadoraDemo({ c }: { c: string }) {
  const list = [
    { n: "Contato 01", r: "atendeu" }, { n: "Contato 02", r: "caixa" }, { n: "Contato 03", r: "caixa" },
    { n: "Contato 04", r: "atendeu" }, { n: "Contato 05", r: "caixa" },
  ];
  const { ref, i } = useTicker(1100, list.length * 2);
  const cur = Math.floor(i / 2), phase = i % 2; // 0 = discando, 1 = resultado
  return (
    <div ref={ref} className="grid h-full grid-cols-[1.2fr_1fr] gap-3">
      <ul className="flex flex-col gap-1.5">
        {list.map((l, k) => {
          const done = k < cur || (k === cur && phase === 1);
          return (
            <li key={l.n} className={`flex items-center justify-between rounded-lg border px-2.5 py-2 text-[11px] transition-colors ${k === cur ? "border-white/25 bg-white/[.05]" : "border-white/[.06]"}`}>
              <span className="text-white/75">{l.n}</span>
              <span className="font-mono text-[9px]" style={{ color: done ? (l.r === "atendeu" ? "#4ade80" : c) : "rgba(255,255,255,.35)" }}>
                {k === cur && phase === 0 ? "discando…" : done ? (l.r === "atendeu" ? "atendeu ✓" : "caixa → desligou") : "na fila"}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-white/[.07] bg-black/30">
        <div className="flex h-14 items-center gap-1">
          {Array.from({ length: 12 }, (_, k) => (
            <motion.i key={k} className="w-1 rounded-full" style={{ background: c }}
              animate={{ height: phase === 0 ? [6, 18 + ((k * 7) % 30), 6] : list[cur].r === "atendeu" ? [8, 40, 8] : 4 }}
              transition={{ duration: 0.6 + (k % 4) * 0.1, repeat: Infinity }} />
          ))}
        </div>
        <p className="font-mono text-[10px] text-white/55">{phase === 0 ? "detectando…" : list[cur].r === "atendeu" ? "pessoa → conecta" : "caixa postal → desliga"}</p>
      </div>
    </div>
  );
}

/* 4. Polymarket: notas recalculadas e ranking reordenando */
export function PolymarketDemo({ c }: { c: string }) {
  const base = [
    { n: "Mercado A", s: [6.1, 7.4, 5.2] }, { n: "Mercado B", s: [7.8, 5.9, 6.6] }, { n: "Mercado C", s: [5.0, 6.8, 8.1] },
    { n: "Mercado D", s: [6.9, 4.7, 5.8] }, { n: "Mercado E", s: [4.2, 6.1, 7.0] },
  ];
  const { ref, i } = useTicker(2200, 3);
  const ranked = [...base].sort((a, b) => b.s[i] - a.s[i]);
  return (
    <div ref={ref} className="flex h-full flex-col">
      <div className="mb-2 flex justify-between font-mono text-[9px] text-white/35"><span>mercado</span><span>score</span></div>
      <ul className="flex flex-1 flex-col gap-1.5">
        {ranked.map((m, k) => (
          <motion.li layout key={m.n} transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex items-center gap-3 rounded-lg border border-white/[.06] bg-black/30 px-3 py-2 text-[11px]">
            <span className="w-4 font-mono text-white/35">{k + 1}</span>
            <span className="w-20 text-white/75">{m.n}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded bg-white/10">
              <motion.div className="h-full rounded" style={{ background: c }} animate={{ width: `${m.s[i] * 11}%` }} transition={{ duration: 0.8 }} />
            </div>
            <span className="w-8 text-right font-mono text-white/70">{m.s[i].toFixed(1)}</span>
          </motion.li>
        ))}
      </ul>
      <p className="mt-2 font-mono text-[9px] text-white/35">somente leitura · sem carteira · sem ordens</p>
    </div>
  );
}

/* 5. IA no terminal: comando + barras de compressão (números do benchmark real) */
export function TerminalDemo({ c }: { c: string }) {
  const lines = ["$ claude-hr", "→ headroom proxy :8788", "→ 9router :20128", "comprimindo contexto…"];
  const bench = [
    { n: "logs repetitivos", pct: 99.7 }, { n: "JSON de ferramentas", pct: 30.3 }, { n: "código-fonte", pct: 0 },
  ];
  const { ref, i } = useTicker(700, lines.length + 6);
  return (
    <div ref={ref} className="flex h-full flex-col gap-3 font-mono text-[11px]">
      <div className="rounded-xl border border-white/[.07] bg-black/50 p-3 leading-5">
        {lines.map((l, k) => (
          <motion.p key={l} animate={{ opacity: k <= i ? 1 : 0 }} className={k === 0 ? "text-white" : "text-white/55"}>{l}</motion.p>
        ))}
      </div>
      <div className="flex flex-1 flex-col justify-center gap-3">
        {bench.map((b) => (
          <div key={b.n}>
            <div className="flex justify-between text-[10px]"><span className="text-white/60">{b.n}</span><span style={{ color: c }}>−{b.pct.toString().replace(".", ",")}%</span></div>
            <div className="mt-1 h-2 overflow-hidden rounded bg-white/10">
              <motion.div className="h-full rounded bg-white/40" animate={{ width: i >= lines.length ? `${100 - b.pct}%` : "100%" }} transition={{ duration: 1.2, ease: "easeInOut" }} />
            </div>
          </div>
        ))}
        <p className="text-[9px] text-white/30">tokens restantes após a compressão (benchmark offline)</p>
      </div>
    </div>
  );
}

/* 6. Leads: pacote viaja do formulário, passa pela checagem no CRM e alterna vendedora */
export function LeadsDemo({ c }: { c: string }) {
  const { ref, i } = useTicker(1600, 4);
  const dup = i === 2;          // terceiro lead já existe no CRM
  const seller = i % 2 === 0 ? "A" : "B";
  const node = "rounded-xl border bg-black/40 px-3 py-2 text-center text-[11px]";
  return (
    <div ref={ref} className="relative flex h-full flex-col justify-center gap-6">
      <div className="flex items-center justify-between gap-2">
        <div className={`${node} border-white/15`}>Formulário</div>
        <div className="relative h-px flex-1 bg-white/15">
          <motion.span key={i} className="absolute -top-1 h-2 w-2 rounded-full" style={{ background: c }} initial={{ left: "0%" }} animate={{ left: "100%" }} transition={{ duration: 0.6 }} />
        </div>
        <div className={`${node}`} style={{ borderColor: c }}>Já existe<br />no CRM?</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[["Vendedora A", !dup && seller === "A"], ["Vendedora B", !dup && seller === "B"], ["Duplicado: ignora", dup]].map(([l, on]) => (
          <motion.div key={l as string} className={`${node}`} animate={{ borderColor: on ? c : "rgba(255,255,255,.1)", scale: on ? 1.05 : 1, opacity: on ? 1 : 0.45 }}>
            {l as string}
          </motion.div>
        ))}
      </div>
      <p className="text-center font-mono text-[10px] text-white/40">lead #{i + 1} → {dup ? "já cadastrado, não duplica" : `vendedora ${seller}`}</p>
    </div>
  );
}

/* 7. Sites: navegador com uma mini page rolando */
export function SitesDemo({ c }: { c: string }) {
  return (
    <div className="h-full overflow-hidden rounded-xl border border-white/[.07] bg-black/40">
      <motion.div className="space-y-3 p-4" animate={{ y: ["0%", "-45%", "0%"] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}>
        <div className="flex items-center justify-between"><span className="h-2 w-14 rounded bg-white/40" /><span className="h-2 w-20 rounded bg-white/15" /></div>
        <div className="space-y-2 py-4"><div className="h-5 w-3/4 rounded bg-white/80" /><div className="h-5 w-1/2 rounded" style={{ background: c }} /><div className="h-2 w-2/3 rounded bg-white/20" /></div>
        <div className="h-6 w-24 rounded-full" style={{ background: c }} />
        <div className="grid grid-cols-3 gap-2 pt-2">{[0, 1, 2].map((k) => <div key={k} className="aspect-square rounded-lg bg-white/10" />)}</div>
        <div className="space-y-1.5 pt-2"><div className="h-2 w-full rounded bg-white/15" /><div className="h-2 w-5/6 rounded bg-white/15" /><div className="h-2 w-4/6 rounded bg-white/15" /></div>
        <div className="grid grid-cols-2 gap-2 pt-2">{[0, 1].map((k) => <div key={k} className="h-16 rounded-lg bg-white/[.07]" />)}</div>
        <div className="h-8 w-full rounded-lg border border-white/15" />
      </motion.div>
    </div>
  );
}

export const DEMOS: Record<string, (p: { c: string }) => ReactNode> = {
  "hub-v4": HubDemo,
  cobranca: CobrancaDemo,
  discadora: DiscadoraDemo,
  "polymarket-scanner": PolymarketDemo,
  "ia-no-terminal": TerminalDemo,
  "roteamento-leads": LeadsDemo,
  "sites-criativos": SitesDemo,
};

/* Print real do site, rolando devagar dentro da janela, com link quando público */
export function Shot({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]" />
  );
}
