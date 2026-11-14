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
const SMOOTH = typeof window !== "undefined" && isTouch() ? 2 : 4; // menos vértices em celular

// Estados do teclado por seção. x em "meia largura de tela" (−1..1), resto em unidades da cena.
type Pose = { x: number; y: number; z: number; rx: number; ry: number; rz: number; s: number };
const POSES: Record<"hidden" | "skills" | "portfolio" | "contato", Pose> = {
  hidden: { x: 0.35, y: -9, z: 0, rx: 1.1, ry: 0, rz: 0.9, s: 0.7 },
  skills: { x: 0.45, y: -0.2, z: 0, rx: 0.95, ry: 0, rz: 0.55, s: 0.82 },
  portfolio: { x: 0.15, y: -1.6, z: -8, rx: 1.25, ry: 0, rz: -0.35, s: 1 },
  contato: { x: 0.62, y: 1.4, z: -3, rx: 0.8, ry: 0.25, rz: -0.6, s: 0.75 },
};
const MOBILE: typeof POSES = {
  hidden: { ...POSES.hidden, x: 0 },
  skills: { x: 0, y: -2.7, z: 0, rx: 0.95, ry: 0, rz: 0.55, s: 0.48 },
  portfolio: { x: 0, y: -1, z: -10, rx: 1.2, ry: 0, rz: -0.35, s: 1 },
  contato: { x: 0, y: 5.5, z: -9, rx: 0.8, ry: 0.25, rz: -0.6, s: 0.55 },
};

export default function Keyboard3D() {
  // sem WebGL o teclado some; a lista de botões da seção Skills continua funcionando
  return <GLBoundary fallback={null}><KeyboardCanvas /></GLBoundary>;
}

function KeyboardCanvas() {
  const touch = useMemo(isTouch, []);
  // antes da seção Skills o teclado fica escondido: não precisa renderizar
  const [on, setOn] = useState(false);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({ trigger: "#skills", start: "top bottom", endTrigger: "#contato", end: "bottom top", onToggle: (s) => setOn(s.isActive) });
    setOn(st.isActive);
    return () => st.kill();
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <Canvas frameloop={on ? "always" : "never"} camera={{ position: [0, 0, 14], fov: 32 }} dpr={touch ? 1 : [1, 1.5]} eventSource={typeof document !== "undefined" ? document.body : undefined} eventPrefix="client"
        gl={{ alpha: true, antialias: !touch, powerPreference: touch ? "low-power" : "default" }} style={{ background: "transparent" }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 8, 6]} intensity={2.2} />
        <directionalLight position={[-6, -2, 4]} intensity={0.6} color="#9ab" />
        <Environment resolution={touch ? 32 : 128} environmentIntensity={0.6}>
          <Lightformer intensity={2} position={[0, 5, 5]} scale={[10, 10, 1]} />
          <Lightformer intensity={1} position={[-5, 0, 3]} rotation={[0, Math.PI / 2, 0]} scale={[10, 2, 1]} />
        </Environment>
        <Board />
      </Canvas>
    </div>
  );
}

function Board() {
  const group = useRef<THREE.Group>(null!);
  const pose = useRef<Pose>({ ...POSES.hidden });
  const interactive = useRef(false);
  const { viewport, size } = useThree();
  const halfW = useRef(viewport.width / 2);
  halfW.current = viewport.width / 2;

  // timeline do scroll: cada transição é uma faixa de scroll própria
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const P = innerWidth < 768 ? MOBILE : POSES;
    const p = pose.current;
    Object.assign(p, P.hidden);
    const tw = (from: Pose, to: Pose, trigger: string, start: string, end: string) =>
      gsap.fromTo(p, { ...from }, { ...to, ease: "power1.inOut", immediateRender: false, scrollTrigger: { trigger, start, end, scrub: 1 } });
    const t = [
      tw(P.hidden, P.skills, "#skills", "top bottom", "top 15%"),
      tw(P.skills, P.portfolio, "#portfolio", "top 85%", "top 10%"),
      tw(P.portfolio, P.contato, "#contato", "top bottom", "top 20%"),
      // no celular o contato é longo: o teclado sobe e sai antes do formulário e dos cards
      ...(P === MOBILE ? [tw(P.contato, { ...P.contato, y: 16 }, "#contato", "top 20%", "top -30%")] : []),
    ];
    const st = ScrollTrigger.create({ trigger: "#skills", start: "top 40%", end: "bottom 40%", onToggle: (s) => (interactive.current = s.isActive) });
    ScrollTrigger.refresh();
    return () => { t.forEach((x) => { x.scrollTrigger?.kill(); x.kill(); }); st.kill(); };
  }, [size.width]);

  useFrame((_, dt) => {
    const g = group.current, p = pose.current, k = 6;
    g.position.x = THREE.MathUtils.damp(g.position.x, p.x * halfW.current, k, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, p.y, k, dt);
    g.position.z = THREE.MathUtils.damp(g.position.z, p.z, k, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, p.rx, k, dt);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, p.ry, k, dt);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, p.rz, k, dt);
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, p.s, k, dt));
  });

  const rows = Math.ceil((KEYS.length + 1) / COLS);
  const w = COLS * STEP + 0.3, d = rows * STEP + 0.3;
  return (
    <group ref={group} rotation-order="ZXY">
      {/* teclas modeladas no plano XZ (y = altura); +90° em x deixa o tampo virado para a câmera */}
      <group rotation-x={Math.PI / 2}>
        <RoundedBox args={[w, 0.35, d]} radius={0.16} smoothness={4} position={[0, -0.12, 0]}>
          <meshStandardMaterial color="#141416" roughness={0.6} metalness={0.4} />
        </RoundedBox>
        {KEYS.map((t, i) => (
          <Key key={t.id} tech={t} interactive={interactive}
            position={[(i % COLS - (COLS - 1) / 2) * STEP, H / 2, (Math.floor(i / COLS) - (rows - 1) / 2) * STEP]} />
        ))}
        <Key tech={{ id: "lc", label: "Leonardo Capella", text: "LC", color: "#EDEDED", ink: "#111", phrase: "" }} interactive={interactive}
          position={[((KEYS.length % COLS) - (COLS - 1) / 2) * STEP, H / 2, (rows - 1 - (rows - 1) / 2) * STEP]} />
      </group>
    </group>
  );
}

function Key({ tech, position, interactive }: { tech: Tech; position: [number, number, number]; interactive: React.RefObject<boolean> }) {
  const ref = useRef<THREE.Group>(null!);
  const press = useRef(0); // 0..1 afundamento alvo
  const hover = useRef(false);
  const tex = useMemo(() => keyTexture(tech), [tech]);

  useEffect(() => {
    const on = (e: Event) => { if ((e as CustomEvent<string>).detail === tech.id) press.current = 1; };
    addEventListener("key-press", on);
    return () => removeEventListener("key-press", on);
  }, [tech.id]);

  useFrame((_, dt) => {
    const target = position[1] - press.current * 0.32 + (hover.current ? 0.06 : 0);
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, target, 18, dt);
    press.current = THREE.MathUtils.damp(press.current, 0, 5, dt);
  });

  return (
    <group ref={ref} position={position}
      onPointerOver={(e) => { if (!interactive.current) return; e.stopPropagation(); hover.current = true; document.body.dataset.keyhover = "1"; }}
      onPointerOut={() => { hover.current = false; delete document.body.dataset.keyhover; }}
      onClick={(e) => { if (!interactive.current) return; e.stopPropagation(); dispatchEvent(new CustomEvent("key-press", { detail: tech.id })); }}>
      <RoundedBox args={[SIZE, H, SIZE]} radius={0.14} smoothness={SMOOTH}>
        <meshStandardMaterial color={tech.color} roughness={0.35} metalness={0.05} />
      </RoundedBox>
      <mesh rotation-x={-Math.PI / 2} position-y={H / 2 + 0.002}>
        <planeGeometry args={[SIZE - 0.22, SIZE - 0.22]} />
        <meshStandardMaterial map={tex} roughness={0.35} />
      </mesh>
    </group>
  );
}

function keyTexture(t: Tech) {
  return canvasTexture(256, 256, (c) => {
    c.fillStyle = t.color; c.fillRect(0, 0, 256, 256);
    c.fillStyle = t.ink;
    if (t.icon) {
      c.save(); c.translate(68, 68); c.scale(120 / 24, 120 / 24);
      c.fill(new Path2D(t.icon.path)); c.restore();
    } else {
      c.textAlign = "center"; c.textBaseline = "middle";
      c.font = `900 ${t.text!.length > 4 ? 52 : t.text!.length > 2 ? 78 : 96}px ${fontVar("--font-display")}`;
      c.fillText(t.text!, 128, 134);
    }
  });
}
