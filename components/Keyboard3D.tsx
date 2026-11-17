"use client";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { KEYS, type Tech } from "@/lib/data";
import { canvasTexture, fontVar } from "@/lib/canvasTex";
import { isTouch } from "@/lib/gfx";
import GLBoundary from "./GLBoundary";

const COLS = 5, SIZE = 1, GAP = 0.16, H = 0.55;
const STEP = SIZE + GAP;
// última tecla, só assinatura: fecha a grade em fileiras de 5 (checado em lib/data.check.ts)
const LC: Tech = { id: "lc", label: "Leonardo Capella", group: "Linguagens", text: "LC", color: "#EDEDED", ink: "#111", phrase: "" };
const SMOOTH = typeof window !== "undefined" && isTouch() ? 2 : 4; // menos vértices em celular

// Estados do teclado por seção. x em "meia largura de tela" (−1..1), resto em unidades da cena.
type Pose = { x: number; y: number; z: number; rx: number; ry: number; rz: number; s: number };
const POSES: Record<"hidden" | "skills" | "portfolio" | "contato", Pose> = {
  hidden: { x: 0.5, y: 9, z: 0, rx: 0, ry: 0, rz: 0, s: 0.6 },
  skills: { x: 0.5, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 0.6 },
  portfolio: { x: 0.5, y: 9, z: 0, rx: 0, ry: 0, rz: 0, s: 0.6 },
  contato: { x: 0.5, y: 9, z: 0, rx: 0, ry: 0, rz: 0, s: 0.6 },
};
const MOBILE: typeof POSES = {
  hidden: { x: 0, y: 9, z: 0, rx: 0, ry: 0, rz: 0, s: 0.52 },
  skills: { x: 0, y: -2.6, z: 0, rx: 0, ry: 0, rz: 0, s: 0.52 },
  portfolio: { x: 0, y: 9, z: 0, rx: 0, ry: 0, rz: 0, s: 0.52 },
  contato: { x: 0, y: 9, z: 0, rx: 0, ry: 0, rz: 0, s: 0.52 },
};

export default function Keyboard3D() {
  // sem WebGL o teclado some; a lista de botões da seção Skills continua funcionando
  return (
    <div aria-hidden className="absolute inset-x-0 bottom-0 top-[34svh] z-0 md:inset-0">
      <GLBoundary fallback={null}><KeyboardCanvas /></GLBoundary>
    </div>
  );
}

function KeyboardCanvas() {
  const touch = useMemo(isTouch, []);
  // canvas mora dentro de #skills (overflow hidden): fora da seção não existe na tela
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = document.getElementById("skills");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Canvas frameloop={on ? "always" : "never"} camera={{ position: [0, 0, 14], fov: 32 }} dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 2, 2)]}
        gl={{ alpha: true, antialias: true, powerPreference: touch ? "low-power" : "default" }} style={{ background: "transparent" }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 8, 6]} intensity={2.2} />
        <directionalLight position={[-6, -2, 4]} intensity={0.6} color="#9ab" />
        <Environment resolution={touch ? 32 : 128} environmentIntensity={0.6}>
          <Lightformer intensity={2} position={[0, 5, 5]} scale={[10, 10, 1]} />
          <Lightformer intensity={1} position={[-5, 0, 3]} rotation={[0, Math.PI / 2, 0]} scale={[10, 2, 1]} />
        </Environment>
        <Board />
      </Canvas>
  );
}

function Board() {
  const group = useRef<THREE.Group>(null!);
  const pose = useRef<Pose>({ ...POSES.hidden });
  const interactive = useRef(false);
  const tilt = useRef({ x: 0, y: 0 }); // inclinação de parallax que segue o ponteiro
  const { viewport, size } = useThree();
  const halfW = useRef(viewport.width / 2);
  halfW.current = viewport.width / 2;

  // ponteiro inclina o teclado de leve; no celular (sem hover) fica reto
  useEffect(() => {
    if (isTouch()) return;
    const on = (e: PointerEvent) => {
      if (!interactive.current) return;
      tilt.current.y = ((e.clientX / innerWidth) * 2 - 1) * 0.26;
      tilt.current.x = ((e.clientY / innerHeight) * 2 - 1) * 0.16;
    };
    addEventListener("pointermove", on, { passive: true });
    return () => removeEventListener("pointermove", on);
  }, []);

  // timeline do scroll: cada transição é uma faixa de scroll própria
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const P = innerWidth < 768 ? MOBILE : POSES;
    const p = pose.current;
    Object.assign(p, P.hidden);
    const tw = (from: Pose, to: Pose, trigger: string, start: string, end: string) =>
      gsap.fromTo(p, { ...from }, { ...to, ease: "power1.inOut", immediateRender: false, scrollTrigger: { trigger, start, end, scrub: 1 } });
    const t = [
      tw(P.hidden, P.skills, "#skills", "top 85%", "top 40%"),
      tw(P.skills, P.portfolio, "#skills", "bottom 100%", "bottom 70%"),
    ];
    const st = ScrollTrigger.create({ trigger: "#skills", start: "top 40%", end: "bottom 40%", onToggle: (s) => (interactive.current = s.isActive) });
    ScrollTrigger.refresh();
    return () => { t.forEach((x) => { x.scrollTrigger?.kill(); x.kill(); }); st.kill(); };
  }, [size.width]);

  useFrame((_, dt) => {
    const g = group.current, p = pose.current, k = 6;
    const t = interactive.current ? tilt.current : { x: 0, y: 0 };
    g.position.x = THREE.MathUtils.damp(g.position.x, p.x * halfW.current, k, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, p.y, k, dt);
    g.position.z = THREE.MathUtils.damp(g.position.z, p.z, k, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, p.rx + t.x, k, dt);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, p.ry + t.y, k, dt);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, p.rz, k, dt);
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, p.s, k, dt));
  });

  const rows = Math.ceil((KEYS.length + 1) / COLS);
  const w = COLS * STEP + 0.3, d = rows * STEP + 0.3;
  // onde cada tecla está na grade: a onda de uma tecla apertada usa a distância até as vizinhas
  const spots = useMemo(() => {
    const all = [...KEYS, LC];
    return new Map(all.map((t, i) => [t.id, [i % COLS, Math.floor(i / COLS)] as [number, number]]));
  }, []);
  return (
    <group ref={group} rotation-order="ZXY">
      {/* teclas modeladas no plano XZ (y = altura); +90° em x deixa o tampo virado para a câmera */}
      <group rotation-x={Math.PI / 2}>
        <RoundedBox args={[w, 0.35, d]} radius={0.16} smoothness={4} position={[0, -0.12, 0]}>
          <meshStandardMaterial color="#141416" roughness={0.6} metalness={0.4} />
        </RoundedBox>
        {[...KEYS, LC].map((t, i) => (
          <Key key={t.id} tech={t} interactive={interactive} spots={spots}
            position={[(i % COLS - (COLS - 1) / 2) * STEP, H / 2, (Math.floor(i / COLS) - (rows - 1) / 2) * STEP]} />
        ))}
      </group>
    </group>
  );
}

function Key({ tech, position, interactive, spots }: { tech: Tech; position: [number, number, number]; interactive: React.RefObject<boolean>; spots: Map<string, [number, number]> }) {
  const ref = useRef<THREE.Group>(null!);
  const mat = useRef<THREE.MeshStandardMaterial>(null!);
  const press = useRef(0); // 0..1 afundamento alvo
  const glow = useRef(0); // brilho da tecla escolhida, separado do afundamento
  const wave = useRef({ delay: 0, amt: 0 }); // quique atrasado quando a vizinha é apertada
  const hover = useRef(false);
  const tex = useMemo(() => keyTexture(tech), [tech]);

  useEffect(() => {
    const on = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (id === tech.id) { press.current = 1; glow.current = 1; return; }
      // onda: sai da tecla apertada e morre em ~3 casas de distância
      const a = spots.get(id), b = spots.get(tech.id);
      if (!a || !b) return;
      const dist = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (dist > 3.2) return;
      wave.current = { delay: dist * 0.045, amt: 0.42 / (1 + dist) };
    };
    addEventListener("key-press", on);
    return () => removeEventListener("key-press", on);
  }, [tech.id, spots]);

  useFrame((_, dt) => {
    const wv = wave.current;
    if (wv.amt) {
      wv.delay -= dt;
      if (wv.delay <= 0) { press.current = Math.max(press.current, wv.amt); wv.amt = 0; }
    }
    const target = position[1] - press.current * 0.32 + (hover.current ? 0.06 : 0);
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, target, 18, dt);
    press.current = THREE.MathUtils.damp(press.current, 0, 5, dt);
    glow.current = THREE.MathUtils.damp(glow.current, 0, 2.2, dt);
    mat.current.emissiveIntensity = glow.current * 0.55;
  });

  return (
    <group ref={ref} position={position}>
      <RoundedBox args={[SIZE, H, SIZE]} radius={0.14} smoothness={SMOOTH}
        onPointerOver={(e) => { if (!interactive.current) return; e.stopPropagation(); hover.current = true; document.body.dataset.keyhover = "1"; }}
        onPointerOut={() => { hover.current = false; delete document.body.dataset.keyhover; }}
        onClick={(e) => { if (!interactive.current) return; e.stopPropagation(); dispatchEvent(new CustomEvent("key-press", { detail: tech.id })); }}>
        <meshStandardMaterial ref={mat} color={tech.color} emissive={tech.color} emissiveIntensity={0} roughness={0.35} metalness={0.05} />
      </RoundedBox>
      <mesh rotation-x={-Math.PI / 2} position-y={H / 2 + 0.002}>
        <planeGeometry args={[SIZE - 0.22, SIZE - 0.22]} />
        <meshStandardMaterial map={tex} roughness={0.35} />
      </mesh>
    </group>
  );
}

function keyTexture(t: Tech) {
  const S = 1024;
  return canvasTexture(S, S, (c) => {
    c.fillStyle = t.color; c.fillRect(0, 0, S, S);
    c.fillStyle = t.ink;
    if (t.icon) {
      c.save(); c.translate(S * 68 / 256, S * 68 / 256); c.scale((S * 120 / 256) / 24, (S * 120 / 256) / 24);
      c.fill(new Path2D(t.icon.path)); c.restore();
    } else {
      c.textAlign = "center"; c.textBaseline = "middle";
      c.font = `900 ${(t.text!.length > 4 ? 52 : t.text!.length > 2 ? 78 : 96) * S / 256}px ${fontVar("--font-display")}`;
      c.fillText(t.text!, S / 2, t.id === "aws" ? S * 112 / 256 : S * 134 / 256);
      if (t.id === "aws") { // sorriso laranja da marca
        c.strokeStyle = "#FF9900"; c.lineWidth = 11 * S / 256; c.lineCap = "round";
        c.beginPath(); c.moveTo(S * 72 / 256, S * 160 / 256); c.quadraticCurveTo(S / 2, S * 196 / 256, S * 184 / 256, S * 160 / 256); c.stroke();
        c.beginPath(); c.moveTo(S * 166 / 256, S * 152 / 256); c.lineTo(S * 190 / 256, S * 158 / 256); c.lineTo(S * 182 / 256, S * 180 / 256); c.stroke();
      }
    }
  });
}
