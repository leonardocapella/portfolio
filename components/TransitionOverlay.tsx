"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

const COLS = 8, ROWS = 5;
const D = 0.55; // duração de cada fase

// Overlay preto com linhas de grid se desenhando entre rotas.
export default function TransitionOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const [target, setTarget] = useState<string | null>(null);
  const [from, setFrom] = useState(pathname);

  useEffect(() => {
    const go = (e: Event) => {
      const href = (e as CustomEvent<string>).detail;
      const [path, hash] = href.split("#");
      if ((path || "/") === pathname) {           // mesma página: só rola
        window.__lenis?.scrollTo(hash ? `#${hash}` : 0);
        return;
      }
      setFrom(pathname);
      setTarget(href);
      setTimeout(() => router.push(href, { scroll: false }), D * 1000 + 250);
    };
    window.addEventListener("page-transition", go);
    return () => window.removeEventListener("page-transition", go);
  }, [pathname, router]);

  // rota nova montou: rola até a âncora (se houver) e libera o overlay
  useEffect(() => {
    if (!target || pathname === from) return;
    const hash = target.split("#")[1];
    const t = setTimeout(() => {
      if (hash) window.__lenis?.scrollTo(`#${hash}`, { immediate: true });
      setTarget(null);
    }, 200);
    return () => clearTimeout(t);
  }, [pathname, from, target]);

  return (
    <AnimatePresence>
      {target && (
        <motion.div key="overlay" aria-hidden
          className="fixed inset-0 z-[150] bg-ink"
          initial={{ clipPath: "inset(100% 0 0 0)" }}
          animate={{ clipPath: "inset(0% 0 0 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: D, ease: [0.76, 0, 0.24, 1], delay: 0.15 } }}
          transition={{ duration: D, ease: [0.76, 0, 0.24, 1] }}>
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            {Array.from({ length: COLS - 1 }, (_, i) => (
              <motion.line key={"v" + i} x1={((i + 1) * 100) / COLS} x2={((i + 1) * 100) / COLS} y1="0" y2="100"
                stroke="rgba(255,255,255,.22)" strokeWidth="1" vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: D, delay: 0.1 + i * 0.03 }} />
            ))}
            {Array.from({ length: ROWS - 1 }, (_, i) => (
              <motion.line key={"h" + i} y1={((i + 1) * 100) / ROWS} y2={((i + 1) * 100) / ROWS} x1="0" x2="100"
                stroke="rgba(255,255,255,.22)" strokeWidth="1" vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: D, delay: 0.2 + i * 0.04 }} />
            ))}
          </svg>
          <motion.span className="label absolute bottom-8 left-1/2 -translate-x-1/2 !text-white"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            carregando…
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
