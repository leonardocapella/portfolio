"use client";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { canvasTexture, fontVar, roundRect } from "@/lib/canvasTex";
import { PROFILE } from "@/lib/data";
import { isTouch } from "@/lib/gfx";
import GLBoundary from "./GLBoundary";
import { asset } from "@/lib/base";

// Crachá 3D. Fita é uma faixa reta (geometria fixa) e a presilha é filha do
// cartão: os dois giram juntos. Arrastar o cartão puxa o conjunto; parado, a
// mola traz de volta pro centro e fica. Sem Rapier e sem meshline: os dois
// faziam a fita trocar de forma e o crachá cair sozinho.
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

// mola angular: ângulo e velocidade. Parado, o alvo é 0 e a mola amortece até zerar.
const SPRING = 14, DAMP = 6, DRAG_MAX = 1.05; // balança 1–2 vezes e assenta em ~1,5 s

function Badge() {
  const rig = useRef<THREE.Group>(null!);
  const angle = useRef(0);
  const vel = useRef(0);
  const dragging = useRef(false);
  const grab = useRef(0); // ângulo do cartão no instante do clique, menos o do ponteiro
  const { front, back, strap } = useBadgeTextures();
  const { camera, gl, size } = useThree();
  const tmp = useMemo(() => ({ ndc: new THREE.Vector3(), hit: new THREE.Vector3(), pivot: new THREE.Vector3() }), []);

  // ponteiro (px da tela) vira o ângulo que o cartão teria se o dedo estivesse nele
  const pointerAngle = (clientX: number, clientY: number) => {
    const r = gl.domElement.getBoundingClientRect();
    tmp.ndc.set(((clientX - r.left) / size.width) * 2 - 1, -((clientY - r.top) / size.height) * 2 + 1, 0.5).unproject(camera);
    const dirZ = tmp.ndc.z - camera.position.z;
    tmp.hit.copy(camera.position).addScaledVector(tmp.ndc.sub(camera.position), -camera.position.z / dirZ);
    rig.current.getWorldPosition(tmp.pivot);
    return Math.atan2(tmp.hit.x - tmp.pivot.x, -(tmp.hit.y - tmp.pivot.y));
  };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      angle.current = THREE.MathUtils.clamp(pointerAngle(e.clientX, e.clientY) + grab.current, -DRAG_MAX, DRAG_MAX);
      vel.current = 0;
    };
    const up = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
    };
    // no celular: só enquanto o dedo arrasta o crachá a página não rola. Fora dele o scroll é livre.
    const touchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      const t = e.touches[0];
      if (t) angle.current = THREE.MathUtils.clamp(pointerAngle(t.clientX, t.clientY) + grab.current, -DRAG_MAX, DRAG_MAX);
    };
    const el = gl.domElement;
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    addEventListener("pointercancel", up);
    addEventListener("touchend", up);
    el.addEventListener("touchmove", touchMove, { passive: false });
    return () => {
      removeEventListener("pointermove", move); removeEventListener("pointerup", up); removeEventListener("pointercancel", up);
      removeEventListener("touchend", up); el.removeEventListener("touchmove", touchMove);
    };
  });

  useFrame((_, delta) => {
    if (!dragging.current && (angle.current || vel.current)) {
      // passos fixos de 1/120 s: a mola segue o relógio real em 10 ou 120 fps (GPU fraca inclusive).
      // Teto de 0.5 s para a volta de aba em segundo plano; com subpassos fixos a mola não explode.
      for (let t = Math.min(delta, 0.5); t > 0; t -= 1 / 120) {
        const dt = Math.min(t, 1 / 120);
        vel.current += (-SPRING * angle.current - DAMP * vel.current) * dt;
        angle.current += vel.current * dt;
      }
      // perto do repouso, encaixa em 0: parado não fica oscilando em décimos de pixel
      if (Math.abs(angle.current) < 0.002 && Math.abs(vel.current) < 0.01) { angle.current = 0; vel.current = 0; }
    }
    rig.current.rotation.z = angle.current;
    if (process.env.NODE_ENV !== "production") (window as unknown as { __badgeAngle?: number }).__badgeAngle = angle.current;
  });

  const down = (e: { clientX: number; clientY: number; pointerType: string; stopPropagation: () => void }) => {
    e.stopPropagation();
    dragging.current = true;
    vel.current = 0;
    grab.current = angle.current - pointerAngle(e.clientX, e.clientY);
    if (e.pointerType !== "touch") document.body.style.cursor = "grabbing";
  };

  return (
    <group ref={rig} position={[0, PIVOT_Y, 0]}>
      {/* fita reta, do pivô até o centro do anel (passa por dentro dele). Geometria fixa: não muda de forma. */}
      <mesh position={[0, -2.515 / 2, 0.05]}>
        <boxGeometry args={[0.16, 2.515, 0.012]} />
        <meshStandardMaterial map={strap} roughness={0.6} />
      </mesh>
      <group position={[0, 0.75 - PIVOT_Y, 0]}>
        <group position={[0, 0, -0.05]}
          onPointerOver={(e) => { if (e.pointerType === "touch") return; e.stopPropagation(); document.body.style.cursor = "grab"; }}
          onPointerOut={() => { if (!dragging.current) document.body.style.cursor = ""; }}
          onPointerDown={down}>
          <mesh>
            <boxGeometry args={[1.6, 2.25, 0.03]} />
            <meshPhysicalMaterial attach="material-0" color="#1a1a1a" />
            <meshPhysicalMaterial attach="material-1" color="#1a1a1a" />
            <meshPhysicalMaterial attach="material-2" color="#1a1a1a" />
            <meshPhysicalMaterial attach="material-3" color="#1a1a1a" />
            <meshPhysicalMaterial attach="material-4" map={front} clearcoat={0.5} clearcoatRoughness={0.3} roughness={0.65} metalness={0} envMapIntensity={0.35} />
            <meshPhysicalMaterial attach="material-5" map={back} clearcoat={0.5} clearcoatRoughness={0.3} roughness={0.65} metalness={0} envMapIntensity={0.35} />
          </mesh>
          {/* presilha presa ao cartão: clipe sobre a borda de cima e anel encaixado no clipe, sem vão.
              Clipe y 1.08..1.28; anel com centro em 1.28 + raio menor que o tubo, então sobrepõe o clipe.
              z distintos (cartão 0..±0.015, clipe 0.035, anel 0.05) evitam z-fighting. */}
          <mesh position={[0, 1.18, 0.035]}>
            <boxGeometry args={[0.34, 0.2, 0.04]} />
            <meshStandardMaterial color="#b9b9be" metalness={1} roughness={0.28} />
          </mesh>
          <mesh position={[0, 1.28 + 0.075 - 0.02, 0.05]}>
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
