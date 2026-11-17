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
// cartão: os dois giram juntos. Arrastar o cartão gira o conjunto e, puxando
// para longe do pivô, estica a fita; ao soltar, duas molas (ângulo e tração)
// devolvem tudo ao repouso com a inércia do gesto. Duplo clique vira o cartão.
// Sem Rapier e sem meshline: os dois faziam a fita trocar de forma e o crachá
// cair sozinho.
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
const STRAP_LEN = 2.515, CARD_Y = 0.75 - PIVOT_Y;

// duas molas, as duas com alvo 0 e integração por passo fixo:
// ângulo (balanço lateral) e tração (quanto a fita foi esticada para baixo).
const SPRING = 14, DAMP = 6, DRAG_MAX = 1.05; // balança 1–2 vezes e assenta em ~1,5 s
const PULL_SPRING = 30, PULL_DAMP = 7, PULL_MAX = 1.1; // volta rápida, com um quique; teto deixa o cartão dentro do quadro
const VEL_MAX = 9, PULL_VEL_MAX = 14; // teto da inércia herdada do gesto

function Badge() {
  const rig = useRef<THREE.Group>(null!);
  const strapMesh = useRef<THREE.Mesh>(null!);
  const card = useRef<THREE.Group>(null!);
  const cardMesh = useRef<THREE.Mesh>(null!);
  const angle = useRef(0);
  const vel = useRef(0);
  const pull = useRef(0); // esticada da fita, em unidades da cena
  const pullVel = useRef(0);
  const flipTo = useRef(0); // 0 = frente, PI = verso (duplo clique)
  const dragging = useRef(false);
  const grab = useRef(0); // ângulo do cartão no instante do clique, menos o do ponteiro
  const grabDist = useRef(0); // tração no instante do clique, menos a distância do ponteiro
  const last = useRef({ t: 0, a: 0, p: 0 }); // amostra anterior, para estimar a velocidade do gesto
  const { front, back, strap } = useBadgeTextures();
  const { camera, gl, size } = useThree();
  const tmp = useMemo(() => ({ ndc: new THREE.Vector3(), hit: new THREE.Vector3(), pivot: new THREE.Vector3() }), []);

  // ponteiro (px da tela) vira o ângulo e a distância que o cartão teria se o dedo estivesse nele
  const pointerPolar = (clientX: number, clientY: number) => {
    const r = gl.domElement.getBoundingClientRect();
    tmp.ndc.set(((clientX - r.left) / size.width) * 2 - 1, -((clientY - r.top) / size.height) * 2 + 1, 0.5).unproject(camera);
    const dirZ = tmp.ndc.z - camera.position.z;
    tmp.hit.copy(camera.position).addScaledVector(tmp.ndc.sub(camera.position), -camera.position.z / dirZ);
    rig.current.getWorldPosition(tmp.pivot);
    const dx = tmp.hit.x - tmp.pivot.x, dy = tmp.hit.y - tmp.pivot.y;
    return { a: Math.atan2(dx, -dy), d: Math.hypot(dx, dy) };
  };

  // arrastar: gira e estica ao mesmo tempo, guardando a velocidade de cada eixo
  const drag = (clientX: number, clientY: number) => {
    const { a, d } = pointerPolar(clientX, clientY);
    const na = THREE.MathUtils.clamp(a + grab.current, -DRAG_MAX, DRAG_MAX);
    const np = THREE.MathUtils.clamp(d + grabDist.current, 0, PULL_MAX);
    const t = performance.now(), dt = (t - last.current.t) / 1000;
    if (dt > 0.004) {
      vel.current = THREE.MathUtils.clamp((na - last.current.a) / dt, -VEL_MAX, VEL_MAX);
      pullVel.current = THREE.MathUtils.clamp((np - last.current.p) / dt, -PULL_VEL_MAX, PULL_VEL_MAX);
      last.current = { t, a: na, p: np };
    }
    angle.current = na;
    pull.current = np;
  };

  useEffect(() => {
    const move = (e: PointerEvent) => { if (dragging.current) drag(e.clientX, e.clientY); };
    const up = () => {
      if (!dragging.current) return;
      dragging.current = false;
      // gesto parado antes de soltar não deve jogar o crachá: amostra velha vira velocidade zero
      if (performance.now() - last.current.t > 90) { vel.current = 0; pullVel.current = 0; }
      document.body.style.cursor = "";
    };
    // no celular: só enquanto o dedo arrasta o crachá a página não rola. Fora dele o scroll é livre.
    const touchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      const t = e.touches[0];
      if (t) drag(t.clientX, t.clientY);
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
    if (!dragging.current && (angle.current || vel.current || pull.current || pullVel.current)) {
      // passos fixos de 1/120 s: a mola segue o relógio real em 10 ou 120 fps (GPU fraca inclusive).
      // Teto de 0.5 s para a volta de aba em segundo plano; com subpassos fixos a mola não explode.
      for (let t = Math.min(delta, 0.5); t > 0; t -= 1 / 120) {
        const dt = Math.min(t, 1 / 120);
        vel.current += (-SPRING * angle.current - DAMP * vel.current) * dt;
        angle.current += vel.current * dt;
        pullVel.current += (-PULL_SPRING * pull.current - PULL_DAMP * pullVel.current) * dt;
        pull.current = Math.max(0, pull.current + pullVel.current * dt);
      }
      // perto do repouso, encaixa em 0: parado não fica oscilando em décimos de pixel
      if (Math.abs(angle.current) < 0.002 && Math.abs(vel.current) < 0.01) { angle.current = 0; vel.current = 0; }
      if (pull.current < 0.001 && Math.abs(pullVel.current) < 0.01) { pull.current = 0; pullVel.current = 0; }
    }
    rig.current.rotation.z = angle.current;
    // a fita estica a partir do pivô e o cartão desce junto. A trama estica junto (repeat fixo):
    // aumentar o repeat acrescentaria cópias do texto e deixava a fita ilegível.
    const stretch = 1 + pull.current / STRAP_LEN;
    strapMesh.current.scale.y = stretch;
    strapMesh.current.position.y = (-STRAP_LEN / 2) * stretch;
    card.current.position.y = CARD_Y - pull.current;
    cardMesh.current.rotation.y = THREE.MathUtils.damp(cardMesh.current.rotation.y, flipTo.current, 7, delta);
    if (process.env.NODE_ENV !== "production") Object.assign(window as unknown as Record<string, number>, { __badgeAngle: angle.current, __badgePull: pull.current });
  });

  const down = (e: { clientX: number; clientY: number; pointerType: string; stopPropagation: () => void }) => {
    e.stopPropagation();
    const { a, d } = pointerPolar(e.clientX, e.clientY);
    dragging.current = true;
    vel.current = 0;
    pullVel.current = 0;
    grab.current = angle.current - a;
    grabDist.current = pull.current - d;
    last.current = { t: performance.now(), a: angle.current, p: pull.current };
    if (e.pointerType !== "touch") document.body.style.cursor = "grabbing";
  };

  return (
    <group ref={rig} position={[0, PIVOT_Y, 0]}>
      {/* fita reta, do pivô até o centro do anel (passa por dentro dele). Geometria fixa: a esticada é escala em y. */}
      <mesh ref={strapMesh} position={[0, -STRAP_LEN / 2, 0.05]}>
        <boxGeometry args={[0.16, STRAP_LEN, 0.012]} />
        <meshStandardMaterial map={strap} roughness={0.6} />
      </mesh>
      <group ref={card} position={[0, CARD_Y, 0]}>
        <group position={[0, 0, -0.05]}
          onPointerOver={(e) => { if (e.pointerType === "touch") return; e.stopPropagation(); document.body.style.cursor = "grab"; }}
          onPointerOut={() => { if (!dragging.current) document.body.style.cursor = ""; }}
          onPointerDown={down}
          onDoubleClick={(e) => { e.stopPropagation(); flipTo.current = flipTo.current ? 0 : Math.PI; }}>
          <mesh ref={cardMesh}>
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
