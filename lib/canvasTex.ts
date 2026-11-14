import * as THREE from "three";

// Família real das fontes do next/font (o nome é gerado no build).
export const fontVar = (v: string) =>
  typeof window === "undefined" ? "sans-serif" : getComputedStyle(document.documentElement).getPropertyValue(v).trim() || "sans-serif";

export function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
