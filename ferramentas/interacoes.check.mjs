// Verificação do crachá e do teclado em navegador headless (rAF roda normal, ao contrário de uma aba em segundo plano).
// node ferramentas/interacoes.check.mjs — precisa do dev server (npm run dev -- -p 3100) e de `npx playwright install chromium`
import assert from "node:assert/strict";
import { chromium } from "playwright";

const URL = process.env.URL ?? "http://localhost:3100/";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(URL, { waitUntil: "load" });
await page.waitForFunction(() => "__badgePull" in window, null, { timeout: 20000 });

// --- crachá: arrastar para baixo estica a fita e soltar volta ao repouso ---
// o cartão fica no canvas do hero; varre a vertical até o ponteiro virar "grab"
const box = await page.locator("#inicio canvas").first().boundingBox();
const cx = Math.round(box.x + box.width / 2);
let cy = null;
for (let f = 0.3; f <= 0.8 && cy === null; f += 0.05) {
  const y = Math.round(box.y + box.height * f);
  await page.mouse.move(cx, y);
  await page.waitForTimeout(120);
  if ((await page.evaluate(() => document.body.style.cursor)) === "grab") cy = y;
}
assert.ok(cy !== null, "não achei o cartão: o ponteiro nunca virou 'grab' sobre o canvas do hero");

await page.mouse.down();
await page.mouse.move(cx + 70, cy + 220, { steps: 20 });
await page.waitForTimeout(80);
const held = await page.evaluate(() => ({ pull: window.__badgePull, angle: window.__badgeAngle }));
assert.ok(held.pull > 0.2, `arrastar para baixo deveria esticar a fita, pull=${held.pull}`);
assert.ok(Math.abs(held.angle) > 0.02, `arrastar de lado deveria girar, angle=${held.angle}`);

await page.mouse.up();
await page.waitForFunction(() => window.__badgePull === 0 && window.__badgeAngle === 0, null, { timeout: 6000 });

// o teto de tração não deixa o cartão sair da cena por mais que se puxe
await page.mouse.move(cx, cy);
await page.mouse.down();
await page.mouse.move(cx, cy + 2500, { steps: 10 });
await page.waitForTimeout(60);
const far = await page.evaluate(() => window.__badgePull);
assert.ok(far <= 1.1001, `tração deveria parar no teto de 1.1, veio ${far}`);
await page.mouse.up();
await page.waitForFunction(() => window.__badgePull === 0, null, { timeout: 6000 });

// --- teclado: letra digitada acende a tecnologia correspondente ---
await page.evaluate(() => document.querySelector("#skills").scrollIntoView());
// o scroll é suavizado (Lenis): espera a seção contar como visível antes de digitar
await page.waitForFunction(() => window.__skillsInView === true, null, { timeout: 8000 });

const painel = page.locator("#skills [aria-live]").first();
const digita = async (tecla, esperado) => {
  await page.keyboard.press(tecla);
  await page.waitForFunction(
    (alvo) => document.querySelector("#skills [aria-live]")?.innerText.includes(alvo),
    esperado,
    { timeout: 5000 },
  ).catch(() => {});
  const txt = await painel.innerText();
  assert.match(txt, new RegExp(esperado), `"${tecla}" deveria acender ${esperado}, veio "${txt.split("\n")[0]}"`);
};
await digita("p", "Python");
await digita("ArrowRight", "Java");

await browser.close();
console.log("ok: crachá puxa/volta e teclado responde ao teclado físico");
