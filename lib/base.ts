// Prefixo do GitHub Pages (/portfolio). Vazio em dev e no build normal.
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
// Arquivos de /public: <img>, <a download> e fetch não ganham o basePath sozinhos.
export const asset = (p: string) => BASE + p;
