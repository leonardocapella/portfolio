"use client";
import { DEMOS, Shot, Window } from "./Demos";
import type { Project } from "@/lib/data";
import { asset } from "@/lib/base";

// Ponte para usar a demo (client) na página de detalhes (server).
export default function ProjectDemo({ p }: { p: Project }) {
  const Demo = DEMOS[p.slug] ?? DEMOS["sites-criativos"];
  return (
    <Window title={p.url ? new URL(p.url).host + new URL(p.url).pathname.replace(/\/$/, "") : `${p.slug}.app`} color={p.color} href={p.url}>
      {p.image ? <Shot src={asset(p.image)} alt={`Print do site ${p.title}`} /> : <Demo c={p.color} />}
    </Window>
  );
}
