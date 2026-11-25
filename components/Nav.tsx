"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import TransitionLink from "./TransitionLink";

const LINKS = [
  ["inicio", "Início"], ["sobre", "Sobre"], ["projetos", "Projetos"], ["skills", "Skills"], ["portfolio", "Credenciais"], ["contato", "Contato"],
] as const;

export default function Nav() {
  const pathname = usePathname();
  const [active, setActive] = useState("inicio");

  useEffect(() => {
    if (pathname !== "/") return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" });
    LINKS.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8">
      <nav aria-label="Seções" className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3 md:px-6">
        <TransitionLink href="/#inicio" className="font-mono text-sm tracking-widest">leonardo.dev</TransitionLink>
        <ul className="flex items-center gap-1 text-[13px] md:gap-2">
          {LINKS.map(([id, label]) => (
            <li key={id} className={id === "projetos" || id === "contato" ? "" : "hidden md:block"}>
              <TransitionLink href={`/#${id}`} className="relative block rounded-lg px-2.5 py-1.5 text-white/60 transition-colors hover:text-white md:px-3">
                {pathname === "/" && active === id && (
                  <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-lg bg-white/[.08]" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                )}
                <span className={`relative ${pathname === "/" && active === id ? "text-white" : ""}`}>{label}</span>
              </TransitionLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
