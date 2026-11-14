// @ts-nocheck: roda direto no node (import com .ts)
// Self-check dos dados: node --experimental-strip-types lib/data.check.ts
import assert from "node:assert/strict";
import { KEYS, PROJECTS } from "./data.ts";

const ids = KEYS.map((k) => k.id);
assert.equal(new Set(ids).size, ids.length, "id de tecla duplicado");
for (const want of ["js", "ts", "py", "java", "cpp", "sql", "html", "css", "react", "node", "linux", "aws", "supabase", "github", "kommo", "hubspot", "meta", "gads", "ga"])
  assert.ok(ids.includes(want), `falta tecla ${want}`);
for (const k of KEYS) assert.ok(k.icon || k.text, `tecla ${k.id} sem ícone nem texto`);
const slugs = PROJECTS.map((p) => p.slug);
assert.equal(new Set(slugs).size, slugs.length, "slug duplicado");
for (const p of PROJECTS) {
  assert.match(p.slug, /^[a-z0-9-]+$/, `slug inválido: ${p.slug}`);
  for (const f of ["problem", "solution", "result"] as const) assert.ok(p[f]?.length > 20, `${p.slug} sem ${f}`);
}
assert.equal((KEYS.length + 1) % 5, 0, "teclado: teclas + LC devem fechar fileiras de 5");
console.log(`ok: ${KEYS.length} teclas, ${PROJECTS.length} projetos`);
