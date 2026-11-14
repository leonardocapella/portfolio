// Capacidades do aparelho para o 3D. Só no cliente.
export const isTouch = () => typeof window !== "undefined" && matchMedia("(pointer: coarse)").matches;

export function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
