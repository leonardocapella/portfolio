# Portfólio — Leonardo Capella

Next.js 16 (App Router) + Tailwind 4 + GSAP/ScrollTrigger + Lenis + Framer Motion + three.js (React Three Fiber, drei, rapier).

## Rodar

```bash
npm install
npm run dev -- -p 3100     # http://localhost:3100
npm run build && npm start # produção
node --experimental-strip-types lib/data.check.ts   # self-check dos dados
```

## Onde mexer

- `lib/data.ts`: todos os textos (perfil, projetos, teclas e frases do teclado, certificados). Os placeholders estão marcados com `[PLACEHOLDER]`.
- `components/Lanyard.tsx`: crachá 3D com física. A foto entra na textura (função `useBadgeTextures`).
- `components/Projects.tsx` + `components/demos/Demos.tsx`: seção Projetos (layout alternado) e uma demo animada por projeto, com dados fictícios.
- `components/Keyboard3D.tsx`: teclado 3D fixo. Cada pose por seção fica em `POSES` (desktop) e `MOBILE`.
- `public/assets/`: currículo (botão "Baixar CV") e as duas fotos (fundo preto na seção Sobre, fundo branco no crachá).

## Placeholders

Links de LinkedIn, GitHub e Instagram, certificados, prints dos projetos e links dos sites freelance.
Hub e cobrança estão sem nomes de clientes e sem números internos até o Leonardo confirmar o que pode aparecer.
O formulário de contato abre o app de e-mail (`mailto:`). Para envio direto, é preciso um backend como Resend ou Formspree.

## Publicação (GitHub Pages)

`npm run deploy:pages` gera o site estático em `out/` com basePath `/portfolio` e publica na branch `gh-pages`.
URL: https://leonardocapella.github.io/portfolio/
