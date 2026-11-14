"use client";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { canvasTexture, fontVar, roundRect } from "@/lib/canvasTex";
import { PROFILE } from "@/lib/data";
import { isTouch } from "@/lib/gfx";
import GLBoundary from "./GLBoundary";
import { asset } from "@/lib/base";

// Crachá 3D. Sem física e sem meshline: a fita é uma faixa reta, a presilha é
// filha do cartão. O conjunto balança junto, por seno, atrás do mouse.
// Rapier fazia a fita trocar de forma e o crachá cair parado.
export default function Lanyard() {
  return <GLBoundary fallback={<BadgeFallback />}><LanyardCanvas /></GLBoundary>;
}

// Sem WebGL: o mesmo crachá em HTML, pendurado num cordão estático.
function BadgeFallback() {
  return (
    <div className="flex h-full flex-col items-center pt-6">
      <div className="h-24 w-3 rounded-sm bg-zinc-600" />
      <div className="w-56 rotate-[-3deg] rounded-xl border border-white/10 bg-zinc-800 p-4 shadow-2xl">
        <p className="font-mono text-[10px] text-white/50">leonardo.dev</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset(PROFILE.badgePhoto)} alt="Leonardo Capella" className="mt-2 aspect-[432/340] w-full rounded-lg object-cover object-[50%_20%]" />
        <p className="mt-3 font-[family-name:var(--font-display)] text-lg font-black leading-tight">LEONARDO<br />CAPELLA</p>
        <p className="mt-1 text-[11px] text-white/60">Dados &amp; Automações</p>
      </div>
    </div>
  );
}

function LanyardCanvas() {
  const touch = useMemo(isTouch, []);
  // fora da tela o canvas para
  const wrap = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(true);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: "100px" });
    io.observe(wrap.current!);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={wrap} className="absolute inset-0 overflow-hidden">
    <Canvas resize={{ debounce: 0, scroll: false }} frameloop={on ? "always" : "never"} camera={{ position: [0, 0, 13], fov: 25 }} dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 2, 2)]} gl={{ alpha: true, antialias: true, powerPreference: touch ? "low-power" : "default" }} style={{ background: "transparent" }}>
      <ambientLight intensity={0.5} />
      <Badge />
      <Environment resolution={touch ? 64 : 256} environmentIntensity={0.9}>
        <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
      </Environment>
    </Canvas>
    </div>
  );
}

// o grupo gira em torno do ponto de fixação, no topo da fita
const PIVOT_Y = 4.6;

function Badge() {
  const rig = useRef<THREE.Group>(null!);
  const mouse = useRef(0);
  const sway = useRef(0);
  const { front, back, strap } = useBadgeTextures();

  useEffect(() => {
    const m = (e: PointerEvent) => { mouse.current = (e.clientX / innerWidth) * 2 - 1; };
    addEventListener("pointermove", m);
    return () => removeEventListener("pointermove", m);
  }, []);

  useFrame((_, delta) => {
    // parado o alvo é 0: o crachá volta ao centro e fica
    sway.current = THREE.MathUtils.damp(sway.current, mouse.current * 0.1, 2.5, delta);
    rig.current.rotation.z = sway.current;
  });

  return (
    <group ref={rig} position={[0, PIVOT_Y, 0]}>
      {/* fita reta, do topo até o clipe. Geometria fixa: não muda de forma. */}
      <mesh position={[0, -1.15, 0]}>
        <boxGeometry args={[0.16, 2.3, 0.012]} />
        <meshStandardMaterial map={strap} roughness={0.6} />
      </mesh>
      <group position={[0, 0.75 - PIVOT_Y, 0]}>
        <group position={[0, 0, -0.05]}>
          <mesh>
            <boxGeometry args={[1.6, 2.25, 0.03]} />
            <meshPhysicalMaterial attach="material-0" color="#1a1a1a" />
            <meshPhysicalMaterial attach="material-1" color="#1a1a1a" />
            <meshPhysicalMaterial attach="material-2" color="#1a1a1a" />
            <meshPhysicalMaterial attach="material-3" color="#1a1a1a" />
            <meshPhysicalMaterial attach="material-4" map={front} clearcoat={0.5} clearcoatRoughness={0.3} roughness={0.65} metalness={0} envMapIntensity={0.35} />
            <meshPhysicalMaterial attach="material-5" map={back} clearcoat={0.5} clearcoatRoughness={0.3} roughness={0.65} metalness={0} envMapIntensity={0.35} />
          </mesh>
          {/* presilha: clipe atrás da fita, anel na frente, os dois presos no cartão */}
          <mesh position={[0, 1.18, -0.03]}>
            <boxGeometry args={[0.34, 0.2, 0.04]} />
            <meshStandardMaterial color="#b9b9be" metalness={1} roughness={0.28} />
          </mesh>
          <mesh position={[0, 1.5, 0.05]}>
            <torusGeometry args={[0.075, 0.02, 14, 28]} />
            <meshStandardMaterial color="#d5d5d8" metalness={1} roughness={0.2} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function useBadgeTextures() {
  return useMemo(() => {
    const disp = fontVar("--font-display"), body = fontVar("--font-body");
    const W = 2048, H = 2880, k = 4; // 4x sobre o layout original 512×720
    const front = canvasTexture(W, H, (c) => {
      const g = c.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#1b1b1d"); g.addColorStop(1, "#0b0b0c");
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.strokeStyle = "rgba(255,255,255,.08)"; c.lineWidth = k;
      for (let x = 0; x < W; x += 32 * k) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
      for (let y = 0; y < H; y += 32 * k) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      // furo do cordão
      c.fillStyle = "#050505"; roundRect(c, W / 2 - 46 * k, 26 * k, 92 * k, 16 * k, 8 * k); c.fill();
      c.fillStyle = "#8b8b90"; c.font = `500 ${18 * k}px ui-monospace, monospace`; c.textAlign = "left";
      c.fillText("leonardo.dev", 40 * k, 92 * k);
      c.textAlign = "right"; c.fillText("ID · 2026", W - 40 * k, 92 * k);
      // moldura da foto; a imagem entra quando carregar (abaixo)
      c.fillStyle = "#f4f4f4"; roundRect(c, 40 * k, 120 * k, W - 80 * k, 340 * k, 18 * k); c.fill();
      c.textAlign = "left"; c.fillStyle = "#fff"; c.font = `900 ${46 * k}px ${disp}`;
      c.fillText("LEONARDO", 40 * k, 530 * k); c.fillText("CAPELLA", 40 * k, 584 * k);
      c.fillStyle = "#a1a1a6"; c.font = `400 ${21 * k}px ${body}`;
      c.fillText("Dados & Automações", 40 * k, 626 * k);
      c.fillStyle = "#fff";
      for (let i = 0, x = 40 * k; x < W - 40 * k; i++) { const w = [2, 4, 1, 3][i % 4] * k; c.fillRect(x, 656 * k, w, 34 * k); x += w + 4 * k; }
    });
    const back = canvasTexture(W, H, (c) => {
      c.fillStyle = "#0e0e0f"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#fff"; c.textAlign = "center"; c.font = `900 ${120 * k}px ${disp}`;
      c.fillText("LC", W / 2, H / 2 + 40 * k);
      c.fillStyle = "#8b8b90"; c.font = `500 ${18 * k}px ui-monospace, monospace`;
      c.fillText("PORTO ALEGRE · RS", W / 2, H - 70 * k);
    });
    // faixa vertical: o texto corre de cima pra baixo, uma vez por repetição
    const strap = canvasTexture(256, 1024, (c) => {
      c.fillStyle = "#2a2a2e"; c.fillRect(0, 0, 256, 1024);
      c.fillStyle = "#4a4a50"; c.fillRect(0, 0, 14, 1024); c.fillRect(242, 0, 14, 1024);
      c.save(); c.translate(128, 512); c.rotate(-Math.PI / 2);
      c.fillStyle = "#fff"; c.font = `700 92px ${disp}`; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText("LEONARDO CAPELLA ✦", 0, 0); c.restore();
    });
    strap.wrapS = strap.wrapT = THREE.RepeatWrapping;
    strap.repeat.set(1, 3);
    // foto 3x4 (quadrada, fundo branco) recortada no centro para a moldura 432×340
    const img = new Image();
    img.decoding = "async";
    const draw = () => {
      const c = (front.image as HTMLCanvasElement).getContext("2d")!;
      const fw = W - 80 * k, fh = 340 * k, r = fw / fh;
      const sh = img.height * 0.9, sw = sh * r; // folga acima do cabelo
      c.save(); roundRect(c, 40 * k, 120 * k, fw, fh, 18 * k); c.clip();
      c.drawImage(img, (img.width - sw) / 2, 0, sw, sh, 40 * k, 120 * k, fw, fh);
      c.restore();
      front.needsUpdate = true;
    };
    let tries = 0;
    img.onload = draw;
    img.onerror = () => { if (++tries < 3) setTimeout(() => (img.src = asset(PROFILE.badgePhoto) + "?r=" + tries), 800 * tries); };
    img.src = asset(PROFILE.badgePhoto);
    if (img.complete && img.naturalWidth) draw();
    return { front, back, strap };
  }, []);
}
