import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";

const PORT = 8320, CDP = 9460;
const ROOT = "/workspace/portfolio-leonardo/out";
const OUT = "/workspace/portfolio-leonardo/screenshots";
mkdirSync(OUT, { recursive: true });

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pdf": "application/pdf"
};

const server = createServer((req, res) => {
  let url = req.url.split("?")[0];
  if (url.startsWith("/portfolio")) url = url.slice("/portfolio".length);
  if (!url || url === "/") url = "/index.html";
  if (url.endsWith("/")) url += "index.html";
  let file = join(ROOT, decodeURIComponent(url));
  if (!existsSync(file) && existsSync(file + ".html")) file += ".html";
  if (!existsSync(file)) {
    res.writeHead(404);
    res.end("Not found: " + url);
    return;
  }
  res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(PORT, "127.0.0.1", r));

const chrome = spawn("google-chrome", [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--use-gl=angle",
  "--use-angle=swiftshader",
  `--remote-debugging-port=${CDP}`,
  "--user-data-dir=/tmp/chrome-all-shots",
  "about:blank"
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i++) {
  await sleep(200);
  try {
    const list = await (await fetch(`http://127.0.0.1:${CDP}/json/list`)).json();
    wsUrl = list.find((t) => t.type === "page")?.webSocketDebuggerUrl;
  } catch {}
}
if (!wsUrl) {
  chrome.kill();
  server.close();
  console.error("Chrome WebSocket not found");
  process.exit(1);
}

const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
});
const send = (method, params = {}) => new Promise((r) => {
  const i = ++id;
  pending.set(i, r);
  ws.send(JSON.stringify({ id: i, method, params }));
});

await send("Page.enable");
await send("Runtime.enable");
await send("Page.addScriptToEvaluateOnNewDocument", {
  source: `sessionStorage.setItem("seen", "1");`
});

// 1) Teste do Crachá em 1440, 1366, 1280, 1024 e Mobile
const viewports = [
  { name: "cracha-1440", w: 1440, h: 900, mobile: false },
  { name: "cracha-1366", w: 1366, h: 768, mobile: false },
  { name: "cracha-1280", w: 1280, h: 800, mobile: false },
  { name: "cracha-1024", w: 1024, h: 768, mobile: false },
  { name: "cracha-mobile-390", w: 390, h: 844, mobile: true, scrollToBadge: true },
];

for (const vp of viewports) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: vp.w,
    height: vp.h,
    deviceScaleFactor: 1,
    mobile: vp.mobile
  });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/portfolio/` });
  await sleep(2500);
  if (vp.scrollToBadge) {
    await send("Runtime.evaluate", { expression: `document.querySelector("[data-hot]").scrollIntoView({ block: "center" })` });
    await sleep(1000);
  }
  const shot = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(OUT, `${vp.name}.png`), Buffer.from(shot.result.data, "base64"));
  console.log(`Saved ${vp.name}.png`);
}

// 2) Teste do Teclado 3D em Desktop e Mobile
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/portfolio/` });
await sleep(2000);
await send("Runtime.evaluate", { expression: `document.querySelector("#skills").scrollIntoView({ block: "center" })` });
await sleep(1500);
const shotSkillsDesktop = await send("Page.captureScreenshot", { format: "png" });
writeFileSync(join(OUT, `teclado-skills-desktop-1440.png`), Buffer.from(shotSkillsDesktop.result.data, "base64"));
console.log(`Saved teclado-skills-desktop-1440.png`);

await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/portfolio/` });
await sleep(2000);
await send("Runtime.evaluate", { expression: `document.querySelector("#skills").scrollIntoView({ block: "center" })` });
await sleep(1500);
const shotSkillsMobile = await send("Page.captureScreenshot", { format: "png" });
writeFileSync(join(OUT, `teclado-skills-mobile-390.png`), Buffer.from(shotSkillsMobile.result.data, "base64"));
console.log(`Saved teclado-skills-mobile-390.png`);

// 3) Teste do Projeto AIVIO Studio na seção Portfolio
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/portfolio/` });
await sleep(2000);
await send("Runtime.evaluate", { expression: `
  const el = Array.from(document.querySelectorAll("h3")).find(h => h.textContent.includes("AIVIO Studio"))?.closest("article");
  if (el) el.scrollIntoView({ block: "center" });
` });
await sleep(1500);
const shotAivio = await send("Page.captureScreenshot", { format: "png" });
writeFileSync(join(OUT, `projeto-aivio-portfolio-1440.png`), Buffer.from(shotAivio.result.data, "base64"));
console.log(`Saved projeto-aivio-portfolio-1440.png`);

ws.close();
chrome.kill();
server.close();
