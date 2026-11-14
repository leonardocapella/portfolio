"use client";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, extend, useFrame, useThree, type ThreeElement } from "@react-three/fiber";
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint, type RapierRigidBody } from "@react-three/rapier";
import { Environment, Lightformer } from "@react-three/drei";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { canvasTexture, fontVar, roundRect } from "@/lib/canvasTex";
import { PROFILE } from "@/lib/data";
import { asset } from "@/lib/base";

extend({ MeshLineGeometry, MeshLineMaterial });
declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: Omit<ThreeElement<typeof MeshLineMaterial>, "args"> & { args?: unknown[] };
  }
}

// Crachá 3D num cordão com física (rapier), no espírito do lanyard da Vercel.
// O ponto de fixação acompanha o mouse de leve; o crachá pode ser arrastado.
export default function Lanyard() {
  // fora da tela o canvas para (economiza GPU e evita a física acumular passo grande ao voltar)
  const wrap = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(true);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting));
    io.observe(wrap.current!);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={wrap} className="h-full w-full">
    <Canvas frameloop={on ? "always" : "never"} camera={{ position: [0, 0, 13], fov: 25 }} dpr={[1, 1.75]} gl={{ alpha: true, antialias: true }} style={{ background: "transparent" }}>
      <ambientLight intensity={0.5} />
      <Physics gravity={[0, -40, 0]} timeStep={1 / 60} interpolate>
        <Band />
      </Physics>
      <Environment resolution={256} environmentIntensity={0.9}>
        <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
      </Environment>
    </Canvas>
    </div>
  );
}

type Body = RapierRigidBody & { lerped?: THREE.Vector3 };
const ANCHOR = new THREE.Vector3(0, 5.2, 0);

function Band({ maxSpeed = 50, minSpeed = 10 }) {
  const band = useRef<THREE.Mesh<MeshLineGeometry>>(null!);
  const fixed = useRef<Body>(null!), j1 = useRef<Body>(null!), j2 = useRef<Body>(null!), j3 = useRef<Body>(null!), card = useRef<Body>(null!);
  const { size } = useThree();
  const [dragged, drag] = useState<THREE.Vector3 | false>(false);
  const tmp = useMemo(() => ({ vec: new THREE.Vector3(), dir: new THREE.Vector3(), ang: new THREE.Vector3(), rot: new THREE.Vector3() }), []);
  const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()], false, "chordal"));
  const mouse = useRef({ x: 0, y: 0 });
  const anchorX = useRef(0);
  const { front, back, strap } = useBadgeTextures();

  useEffect(() => {
    const m = (e: PointerEvent) => { mouse.current.x = (e.clientX / innerWidth) * 2 - 1; mouse.current.y = (e.clientY / innerHeight) * 2 - 1; };
    addEventListener("pointermove", m);
    return () => removeEventListener("pointermove", m);
  }, []);
  useEffect(() => { document.body.style.cursor = dragged ? "grabbing" : ""; }, [dragged]);

  const seg = { type: "dynamic" as const, canSleep: true, colliders: false as const, angularDamping: 2, linearDamping: 2 };
  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.3, 0]]); // topo da argola

  useFrame((state, delta) => {
    const { vec, dir, ang, rot } = tmp;
    if (!fixed.current) return;
    // se a simulação divergir (aba em segundo plano, passo grande), recoloca o cordão no lugar
    const c = card.current.translation();
    if (!Number.isFinite(c.x + c.y + c.z) || Math.abs(c.y) > 30 || Math.abs(c.x) > 30) {
      [j1, j2, j3, card].forEach((r, i) => {
        r.current.setTranslation({ x: ANCHOR.x + 0.5 * (i + 1), y: ANCHOR.y, z: 0 }, true);
        r.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        r.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        r.current.lerped = undefined;
      });
      return;
    }
    // fixação segue o mouse de leve: o crachá balança atrás
    anchorX.current = THREE.MathUtils.damp(anchorX.current, mouse.current.x * 0.35, 3, delta);
    fixed.current.setNextKinematicTranslation({ x: ANCHOR.x + anchorX.current, y: ANCHOR.y, z: 0 });
    if (Math.abs(mouse.current.x) > 0.001) [card, j1, j2, j3].forEach((r) => r.current?.wakeUp());

    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      card.current.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    // suaviza os elos do meio (evita tremido ao puxar forte)
    [j1, j2].forEach((r) => {
      const b = r.current;
      if (!b.lerped) b.lerped = new THREE.Vector3().copy(b.translation());
      const d = Math.max(0.1, Math.min(1, b.lerped.distanceTo(b.translation())));
      b.lerped.lerp(b.translation(), delta * (minSpeed + d * (maxSpeed - minSpeed)));
    });
    curve.points[0].copy(j3.current.translation());
    curve.points[1].copy(j2.current.lerped!);
    curve.points[2].copy(j1.current.lerped!);
    curve.points[3].copy(fixed.current.translation());
    const pts = curve.getPoints(32);
    if (pts.every((v) => Number.isFinite(v.x + v.y + v.z))) band.current.geometry.setPoints(pts);
    ang.copy(card.current.angvel());
    rot.copy(card.current.rotation());
    card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);
  });

  return (
    <>
      <group position={[0, 0, 0]}>{/* cordão: 3 elos de 1u + crachá; ponto fixo acima do topo */}
        <RigidBody ref={fixed} {...seg} type="kinematicPosition" position={ANCHOR.toArray()} />
        <RigidBody ref={j1} {...seg} position={[0.5, 5.2, 0]}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody ref={j2} {...seg} position={[1, 5.2, 0]}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody ref={j3} {...seg} position={[1.5, 5.2, 0]}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody ref={card} {...seg} position={[2, 5.2, 0]} type={dragged ? "kinematicPosition" : "dynamic"}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group position={[0, 0, -0.05]}
            onPointerOver={() => (document.body.style.cursor = "grab")}
            onPointerOut={() => (document.body.style.cursor = "")}
            onPointerUp={(e) => { (e.target as Element).releasePointerCapture(e.pointerId); drag(false); }}
            onPointerDown={(e) => { (e.target as Element).setPointerCapture(e.pointerId); drag(new THREE.Vector3().copy(e.point).sub(tmp.vec.copy(card.current.translation()))); }}>
            <mesh>
              <boxGeometry args={[1.6, 2.25, 0.03]} />
              <meshPhysicalMaterial attach="material-0" color="#1a1a1a" />
              <meshPhysicalMaterial attach="material-1" color="#1a1a1a" />
              <meshPhysicalMaterial attach="material-2" color="#1a1a1a" />
              <meshPhysicalMaterial attach="material-3" color="#1a1a1a" />
              <meshPhysicalMaterial attach="material-4" map={front} clearcoat={0.5} clearcoatRoughness={0.3} roughness={0.65} metalness={0} envMapIntensity={0.35} />
              <meshPhysicalMaterial attach="material-5" map={back} clearcoat={0.5} clearcoatRoughness={0.3} roughness={0.65} metalness={0} envMapIntensity={0.35} />
            </mesh>
            {/* presilha */}
            <mesh position={[0, 1.2, 0.02]}>
              <boxGeometry args={[0.32, 0.16, 0.06]} />
              <meshStandardMaterial color="#c9c9cc" metalness={1} roughness={0.25} />
            </mesh>
            <mesh position={[0, 1.33, 0.02]}>
              <torusGeometry args={[0.07, 0.022, 12, 24]} />
              <meshStandardMaterial color="#c9c9cc" metalness={1} roughness={0.25} />
            </mesh>
          </group>
        </RigidBody>
      </group>
      <mesh ref={band} frustumCulled={false} raycast={() => null}>
        <meshLineGeometry />
        <meshLineMaterial color="white" depthTest={false} resolution={new THREE.Vector2(size.width, size.height)} useMap={1} map={strap} repeat={new THREE.Vector2(-4, 1)} lineWidth={0.75} />
      </mesh>
    </>
  );
}

function useBadgeTextures() {
  return useMemo(() => {
    const disp = fontVar("--font-display"), body = fontVar("--font-body");
    const W = 512, H = 720;
    const front = canvasTexture(W, H, (c) => {
      const g = c.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#1b1b1d"); g.addColorStop(1, "#0b0b0c");
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.strokeStyle = "rgba(255,255,255,.08)"; c.lineWidth = 1;
      for (let x = 0; x < W; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
      for (let y = 0; y < H; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      // furo do cordão
      c.fillStyle = "#050505"; roundRect(c, W / 2 - 46, 26, 92, 16, 8); c.fill();
      c.fillStyle = "#8b8b90"; c.font = `500 18px ui-monospace, monospace`; c.textAlign = "left";
      c.fillText("leonardo.dev", 40, 92);
      c.textAlign = "right"; c.fillText("ID · 2026", W - 40, 92);
      // moldura da foto; a imagem entra quando carregar (abaixo)
      c.fillStyle = "#f4f4f4"; roundRect(c, 40, 120, W - 80, 340, 18); c.fill();
      c.textAlign = "left"; c.fillStyle = "#fff"; c.font = `900 46px ${disp}`;
      c.fillText("LEONARDO", 40, 530); c.fillText("CAPELLA", 40, 584);
      c.fillStyle = "#a1a1a6"; c.font = `400 21px ${body}`;
      c.fillText("Dados & Automações", 40, 626);
      c.fillStyle = "#fff";
      for (let i = 0, x = 40; x < W - 40; i++) { const w = [2, 4, 1, 3][i % 4]; c.fillRect(x, 656, w, 34); x += w + 4; }
    });
    const back = canvasTexture(W, H, (c) => {
      c.fillStyle = "#0e0e0f"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#fff"; c.textAlign = "center"; c.font = `900 120px ${disp}`;
      c.fillText("LC", W / 2, H / 2 + 40);
      c.fillStyle = "#8b8b90"; c.font = `500 18px ui-monospace, monospace`;
      c.fillText("PORTO ALEGRE · RS", W / 2, H - 70);
    });
    const strap = canvasTexture(512, 64, (c) => {
      c.fillStyle = "#3a3a3f"; c.fillRect(0, 0, 512, 64);
      c.fillStyle = "#5a5a60"; c.fillRect(0, 0, 512, 3); c.fillRect(0, 61, 512, 3);
      c.fillStyle = "#fff"; c.font = `700 22px ${disp}`; c.textBaseline = "middle";
      c.fillText("LEONARDO CAPELLA ✦", 18, 34);
    });
    strap.wrapS = strap.wrapT = THREE.RepeatWrapping;
    // foto 3x4 (quadrada, fundo branco) recortada no centro para a moldura 432×340
    const img = new Image();
    img.onload = () => {
      const c = (front.image as HTMLCanvasElement).getContext("2d")!;
      const fw = W - 80, fh = 340, r = fw / fh;
      const sh = img.height * 0.82, sw = sh * r; // corta um pouco do topo/peito para enquadrar o rosto
      c.save(); roundRect(c, 40, 120, fw, fh, 18); c.clip();
      c.drawImage(img, (img.width - sw) / 2, img.height * 0.04, sw, sh, 40, 120, fw, fh);
      c.restore();
      front.needsUpdate = true;
    };
    img.src = asset(PROFILE.badgePhoto);
    return { front, back, strap };
  }, []);
}
