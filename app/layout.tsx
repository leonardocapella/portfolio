import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import TransitionOverlay from "@/components/TransitionOverlay";

const display = localFont({
  src: [
    { path: "./fonts/unbounded-400.woff2", weight: "400" },
    { path: "./fonts/unbounded-700.woff2", weight: "700" },
    { path: "./fonts/unbounded-900.woff2", weight: "900" },
  ],
  variable: "--font-display",
  display: "swap",
});
const body = localFont({
  src: [
    { path: "./fonts/poppins-300.woff2", weight: "300" },
    { path: "./fonts/poppins-400.woff2", weight: "400" },
    { path: "./fonts/poppins-500.woff2", weight: "500" },
    { path: "./fonts/poppins-600.woff2", weight: "600" },
  ],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Leonardo Capella · Analista de Dados & Automações",
  description:
    "Portfólio de Leonardo Capella, Analista de Dados & Automações em Porto Alegre, RS. Automação de processos, integrações, CRM e IA aplicada. Aberto a oportunidades como Analista de Dados / Automações Júnior.",
};
export const viewport: Viewport = { themeColor: "#070707" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body>
        <SmoothScroll />
        <Cursor />
        <Nav />
        {children}
        <TransitionOverlay />
      </body>
    </html>
  );
}
