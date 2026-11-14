"use client";
import { Component, useEffect, useState, type ReactNode } from "react";
import { hasWebGL } from "@/lib/gfx";

// Mostra o fallback se o aparelho não tiver WebGL ou se o canvas falhar ao montar.
class Catch extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function GLBoundary({ fallback, children }: { fallback: ReactNode; children: ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => setOk(hasWebGL()), []);
  if (ok === null) return null;
  return ok ? <Catch fallback={fallback}>{children}</Catch> : <>{fallback}</>;
}
