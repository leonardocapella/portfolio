"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ICONS = [
  <path key="code" d="M8 6 2 12l6 6M16 6l6 6-6 6" />,
  <g key="user"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></g>,
  <g key="globe"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></g>,
];

// Loader inicial: ícones entram, "Bem-vindo" expande, a tela sobe.
export default function Loader() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    if (sessionStorage.getItem("seen") || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShow(false);
      return;
    }
    document.documentElement.dataset.loading = "1";
    const t = setTimeout(() => setShow(false), 2900);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence onExitComplete={() => {
      sessionStorage.setItem("seen", "1");
      delete document.documentElement.dataset.loading;
      dispatchEvent(new Event("loader-done"));
    }}>
      {show && (
        <motion.div key="loader" className="fixed inset-0 z-[180] flex flex-col items-center justify-center bg-black"
          exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}>
          <div className="flex gap-4">
            {ICONS.map((ic, i) => (
              <motion.span key={i} className="grid h-12 w-12 place-items-center rounded-full border border-white/15"
                initial={{ opacity: 0, y: 20, scale: 0.6 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.15, type: "spring", stiffness: 260, damping: 18 }}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{ic}</svg>
              </motion.span>
            ))}
          </div>
          <motion.h1 className="title-xl mt-8 text-center text-[clamp(28px,5vw,64px)]"
            initial={{ opacity: 0, letterSpacing: "-0.2em", filter: "blur(12px)" }}
            animate={{ opacity: 1, letterSpacing: "-0.02em", filter: "blur(0px)" }}
            transition={{ delay: 0.7, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}>
            Bem-vindo ao meu<br />portfólio
          </motion.h1>
          <motion.p className="label mt-6 rounded-full border border-white/10 px-4 py-2"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
            leonardo capella · 2026
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
