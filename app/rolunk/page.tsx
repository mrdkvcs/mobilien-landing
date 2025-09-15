"use client";

import React from "react";
import Link from "next/link";
import NewsletterForm from "@/components/newsletter-form";

export default function RolunkPage() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <div className="min-h-screen bg-[#FFFBFC]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#D9E2E9] bg-[#FFFBFC]/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/mobilien5.png"
              width={50}
              height={50}
              alt="Mobilien Logo"
            />
            <span className="text-xl font-bold text-[#0C1D32]">Mobilien</span>
          </div>
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="https://www.linkedin.com/company/Mobilien-Hungary"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-1 flex items-center justify-center w-8 h-8 rounded-full bg-black text-white hover:bg-[#007AAD] transition-colors"
              title="LinkedIn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z"/>
              </svg>
            </a>
            <Link href="/" className="text-[#0C1D32] hover:text-[#007AAD] transition-colors">Főoldal</Link>
            {/* Ikonok a Problémák fül mellé balra */}
            <a
              href="https://mobilien.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-1 flex items-center justify-center w-8 h-8 rounded-full bg-black text-white text-xs font-bold hover:bg-[#007AAD] transition-colors"
              title="Mobilien.app"
            >
              WA
            </a>
            <a
              href="https://zxc.hu/"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-1 flex items-center justify-center w-8 h-8 rounded-full bg-black text-white text-xs font-bold hover:bg-[#007AAD] transition-colors"
              title="zxc.hu"
            >
              AD
            </a>
            <Link href="/#problems" className="text-[#0C1D32] hover:text-[#007AAD] transition-colors">Problémák</Link>
            <Link href="/#features" className="text-[#0C1D32] hover:text-[#007AAD] transition-colors">Funkciók</Link>
            <Link href="/#mission" className="text-[#0C1D32] hover:text-[#007AAD] transition-colors">Küldetés</Link>
            <Link href="/#newsletter" className="text-[#0C1D32] hover:text-[#007AAD] transition-colors">Hírlevél</Link>
            <Link href="/rolunk" className="text-[#0C1D32] hover:text-[#007AAD] transition-colors font-medium">Rólunk</Link>
          </nav>
          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded focus:outline-none focus:ring-2 focus:ring-[#007AAD]"
            aria-label="Menü megnyitása"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="block w-6 h-0.5 bg-[#0C1D32] mb-1"></span>
            <span className="block w-6 h-0.5 bg-[#0C1D32] mb-1"></span>
            <span className="block w-6 h-0.5 bg-[#0C1D32]"></span>
          </button>
        </div>
        {/* Mobile nav dropdown */}
        {menuOpen && (
          <nav className="md:hidden bg-[#FFFBFC] border-b border-[#D9E2E9] px-6 py-4 flex flex-col gap-4 shadow-lg animate-fade-in z-50">
            <Link href="/" className="text-[#0C1D32] text-lg font-medium" onClick={() => setMenuOpen(false)}>Főoldal</Link>
            <Link href="/#problems" className="text-[#0C1D32] text-lg font-medium" onClick={() => setMenuOpen(false)}>Problémák</Link>
            <Link href="/#features" className="text-[#0C1D32] text-lg font-medium" onClick={() => setMenuOpen(false)}>Funkciók</Link>
            <Link href="/#mission" className="text-[#0C1D32] text-lg font-medium" onClick={() => setMenuOpen(false)}>Küldetés</Link>
            <Link href="/#newsletter" className="text-[#0C1D32] text-lg font-medium" onClick={() => setMenuOpen(false)}>Hírlevél</Link>
            <Link href="/rolunk" className="text-[#0C1D32] text-lg font-medium" onClick={() => setMenuOpen(false)}>Rólunk</Link>
          </nav>
        )}
      </header>

      {/* Rólunk tartalom */}
      <main className="container mx-auto py-20 px-4 flex-1 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-6">Rólunk</h1>
        <p className="text-lg max-w-2xl text-center mb-8">
          A Mobilien csapata elkötelezett a fenntartható közlekedés és az elektromos autózás népszerűsítése mellett. Célunk, hogy mindenki számára elérhetővé tegyük a legmodernebb EV megoldásokat, és segítsük ügyfeleinket a zöldebb jövő felé vezető úton.
          A csapatunk 2025 elején alakult meg és az MVM Edison országos inkubációs program döntős projektjei között szerepelt. 
          Egyesített országos töltőadatbázisunk, valós idejű geolokációs információink, CPO partnereink és működési státuszjelentéseink révén felhasználóink mindig megtalálják a legoptimálisabb és legolcsóbb töltési lehetőségeket. Saját fejlesztésű dinamikus árazási modellünk és AI-asszisztensünk segít az útvonal- és költségoptimalizálásban, elsőként a Magyarországi piacon, miközben hozzájárul a hálózat tehermentesítéséhez és a fenntartható energiagazdálkodáshoz, egy szebb és intelligens jövő érdekében.
        </p>
        {/* Ide jöhet bővebb bemutatkozó szöveg, csapat, misszió, stb. */}

        {/* Vezetőség szekció */}
        <div className="w-full max-w-5xl mx-auto mt-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0C1D32] mb-10 text-center">Vezetőség</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 justify-items-center items-start">
            {/* 1. vezető */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-[#D9E2E9] rounded-full mb-4 overflow-hidden flex items-center justify-center">
                {/* Ide töltsd fel az arcképet: */}
                {/* <img src="/vezetok/babjak-sandor.jpg" alt="Babják Sándor" className="object-cover w-full h-full" /> */}
              </div>
              <div className="text-lg font-semibold text-[#0C1D32] mb-1">Babják Sándor</div>
              <div className="text-sm text-[#007AAD] text-center">CEO / Ügyvezető</div>
            </div>
            {/* 2. vezető */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-[#D9E2E9] rounded-full mb-4 overflow-hidden flex items-center justify-center">
                {/* <img src="/vezetok/anstead-adam.jpg" alt="Anstead Ádám" className="object-cover w-full h-full" /> */}
              </div>
              <div className="text-lg font-semibold text-[#0C1D32] mb-1">Anstead Ádám</div>
              <div className="text-sm text-[#007AAD] text-center">COO / Operatív vezető / Kommunikációs Manager</div>
            </div>
            {/* 3. vezető */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-[#D9E2E9] rounded-full mb-4 overflow-hidden flex items-center justify-center">
                {/* <img src="/vezetok/kovacs-david.jpg" alt="Kovács Dávid" className="object-cover w-full h-full" /> */}
              </div>
              <div className="text-lg font-semibold text-[#0C1D32] mb-1">Kovács Dávid</div>
              <div className="text-sm text-[#007AAD] text-center">CTO / Technológiai vezető / Dev Lead</div>
            </div>
            {/* 4. vezető */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-[#D9E2E9] rounded-full mb-4 overflow-hidden flex items-center justify-center">
                {/* <img src="/vezetok/kovacs-alex.jpg" alt="Kovács Alex" className="object-cover w-full h-full" /> */}
              </div>
              <div className="text-lg font-semibold text-[#0C1D32] mb-1">Kovács Alex</div>
              <div className="text-sm text-[#007AAD] text-center">Head of IT operations / Math Lead / Domain Owner</div>
            </div>
          </div>
        </div>
        {/* Nagy csoportkép */}
        <div className="w-full flex justify-center my-12">
          <div className="relative w-full max-w-4xl">
            <img
              src="/vezetoseg/DSC07337.JPG"
              alt="Vezetőség csoportkép"
              className="w-full object-cover rounded-none shadow-none"
              style={{ border: "none" }}
            />
            <div
              className="absolute left-0 bottom-0 m-4 px-4 py-2 bg-black/60 text-white text-xs md:text-sm rounded-md backdrop-blur-sm"
              style={{ pointerEvents: 'none', maxWidth: '90%' }}
            >
              2025 MVM Edison félidős demo day
            </div>
          </div>
        </div>

        {/* Esemény pillanatok szekció - három kis kép külön szekcióban, a nagy kép után, a Maradj Naprakész szekció előtt */}
        <section className="w-full max-w-6xl mx-auto my-16">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0C1D32] mb-8 text-center"> </h2>
          <div className="flex flex-row flex-wrap justify-center gap-8">
            <img
              src="/vezetoseg/DSC07324.JPG"
              alt="Esemény pillanat 1"
              className="w-full max-w-xs object-cover rounded-md shadow"
              style={{ border: "none" }}
            />
            <img
              src="/vezetoseg/DSC07228.JPG"
              alt="Esemény pillanat 2"
              className="w-full max-w-xs object-cover rounded-md shadow"
              style={{ border: "none" }}
            />
            <img
              src="/vezetoseg/DSC07291.JPG"
              alt="Esemény pillanat 3"
              className="w-full max-w-xs object-cover rounded-md shadow"
              style={{ border: "none" }}
            />
          </div>
        </section>
        {/* Kis vezetőségi képek */}
      </main>

      {/* Newsletter szekció */}
      <section className="py-20 bg-[#0C1D32]">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#FFFBFC] mb-4">
              Maradj Naprakész
            </h2>
            <p className="text-[#D9E2E9] mb-8">
              Légy az első, aki értesül a Mobilien indulásáról, és kapj
              exkluzív frissítéseket a fejlődésünkről.
            </p>
            <NewsletterForm />
            <p className="text-[#D9E2E9]/70 text-sm mt-4">
              Tiszteletben tartjuk a magánéletedet. Bármikor leiratkozhatsz. 
              <Link
                href="/privacy-policy"
                className="text-[#007AAD] hover:underline"
              >
                Adatvédelmi szabályzat
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#0C1D32] border-t border-[#007AAD]/20">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <img
                src="/mobilien5.png"
                width={50}
                height={50}
                alt="Mobilien Logo"
              />
              <span className="text-lg font-bold text-[#FFFBFC]">Mobilien</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mb-4 md:mb-0">
              <Link
                href="/privacy-policy"
                className="text-[#D9E2E9]/80 hover:text-[#FFFBFC] text-sm"
              >
                Adatvédelmi szabályzat
              </Link>
            </div>
            <div className="text-[#D9E2E9]/70 text-sm">
              © {new Date().getFullYear()} Mobilien. Minden jog fenntartva.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
