"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

// Ponto branco que cresce sobre elementos clicáveis. Só em ponteiro fino.
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = dot.current!;
    el.style.display = "block";
    const x = gsap.quickTo(el, "x", { duration: 0.25, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.25, ease: "power3" });
    const move = (e: PointerEvent) => {
      x(e.clientX); y(e.clientY);
      const hot = (e.target as Element)?.closest?.("a,button,input,textarea,[data-hot]");
      gsap.to(el, { scale: hot ? 3.2 : 1, duration: 0.3, overwrite: "auto" });
    };
    const down = () => gsap.to(el, { scale: 0.6, duration: 0.15 });
    addEventListener("pointermove", move);
    addEventListener("pointerdown", down);
    return () => { removeEventListener("pointermove", move); removeEventListener("pointerdown", down); };
  }, []);
  return (
    <div ref={dot} aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[200] -ml-[5px] -mt-[5px] hidden h-[10px] w-[10px] rounded-full bg-white mix-blend-difference" />
  );
}
