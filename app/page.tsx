import Loader from "@/components/Loader";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Portfolio from "@/components/Portfolio";
import Contact from "@/components/Contact";
import Projects from "@/components/Projects";

export default function Home() {
  return (
    <>
      <Loader />
      <div className="blueprint" /><div className="vignette" />
      <main className="relative">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Portfolio />
        <Contact />
      </main>
    </>
  );
}
