"use client";
import type { ComponentProps } from "react";
import { BASE } from "@/lib/base";

// Link que dispara o overlay de transição antes de trocar de rota.
export default function TransitionLink({ href, onClick, ...rest }: ComponentProps<"a"> & { href: string }) {
  return (
    <a href={href.startsWith("/") ? BASE + href : href} {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("page-transition", { detail: href }));
      }} />
  );
}
