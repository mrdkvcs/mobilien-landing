"use client";

import React from "react";
import {
  ChevronRight,
  Map,
  Clock,
  MessageSquareText,
  BarChart3,
  DollarSign,
  Route,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import NewsletterForm from "@/components/newsletter-form";
import AIChatPanel from "@/Agent/frontend/webpage/AIChatPanel";
import { useEffect, useRef } from "react";
import Link from "next/link";

export default function Home() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  // References to sections for scrolling
  const featuresRef = useRef<HTMLElement>(null);
  const missionRef = useRef<HTMLElement>(null);
  const newsletterRef = useRef<HTMLElement>(null);

  // Function to handle smooth scrolling to sections
  const scrollToSection = (sectionRef: React.RefObject<HTMLElement | null>) => {
    if (sectionRef?.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle hash changes for direct links
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#features" && featuresRef.current) {
        featuresRef.current.scrollIntoView({ behavior: "smooth" });
      } else if (hash === "#mission" && missionRef.current) {
        missionRef.current.scrollIntoView({ behavior: "smooth" });
      } else if (hash === "#newsletter" && newsletterRef.current) {
        newsletterRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    // Handle initial hash if present
    if (window.location.hash) {
      // Use setTimeout to ensure the DOM is fully loaded
      setTimeout(handleHashChange, 0);
    }

    // Add event listener for hash changes
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFBFC]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#D9E2E9] bg-[#FFFBFC]/80 backdrop-blur-sm">
        <div className="w-full pl-9 pr-9 md:pl-[54px] md:pr-[54px] flex h-16 items-center justify-between">
          <div className="flex items-center gap-1">
            <img
              src="/mobilien5.png"
              width={36}
              height={36}
              alt="Mobilien Logo"
            />
            <span className="text-xl font-bold text-[#0C1D32]">Mobilien</span>
          </div>
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection(featuresRef)}
              className="text-[#0C1D32] hover:text-[#007AAD] transition-colors"
            >
              Funkciók
            </button>
            <button
              onClick={() => scrollToSection(missionRef)}
              className="text-[#0C1D32] hover:text-[#007AAD] transition-colors"
            >
              Küldetés
            </button>
            <button
              onClick={() => scrollToSection(newsletterRef)}
              className="text-[#0C1D32] hover:text-[#007AAD] transition-colors"
            >
              Hírlevél
            </button>
            <Link
              href="/rolunk"
              className="text-[#0C1D32] hover:text-[#007AAD] transition-colors text-base font-medium"
            >
              Rólunk
            </Link>
            <a
              href="https://www.linkedin.com/company/Mobilien-Hungary"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-1 flex items-center justify-center w-8 h-8 rounded-full bg-black text-white hover:bg-[#069ca8] transition-colors"
              title="LinkedIn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z"/>
              </svg>
            </a>
            <a
              href="https://mobilien.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 inline-flex items-center rounded-xl bg-black text-white px-4 py-2 text-sm font-semibold hover:text-[#069ca8] transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-[#007AAD]/30"
            >
              Irány az app
            </a>
          </nav>
          {/* Mobile hamburger + ikonok */}
          <div className="flex items-center gap-2 md:hidden">
            <a
              href="https://www.linkedin.com/company/Mobilien-Hungary"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-1 flex items-center justify-center w-8 h-8 rounded-full bg-black text-white hover:bg-[#069ca8] transition-colors"
              title="LinkedIn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z"/>
              </svg>
            </a>
            <button
              className="flex flex-col items-center justify-center w-10 h-10 rounded focus:outline-none focus:ring-2 focus:ring-[#007AAD]"
              aria-label="Menü megnyitása"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="block w-6 h-0.5 bg-[#0C1D32] mb-1"></span>
              <span className="block w-6 h-0.5 bg-[#0C1D32] mb-1"></span>
              <span className="block w-6 h-0.5 bg-[#0C1D32]"></span>
            </button>
          </div>
        </div>
        {/* Mobile nav dropdown */}
        {menuOpen && (
          <nav className="md:hidden bg-[#FFFBFC] border-b border-[#D9E2E9] px-6 py-4 flex flex-col gap-4 shadow-lg animate-fade-in z-50">
            <button
              onClick={() => { scrollToSection(featuresRef); setMenuOpen(false); }}
              className="text-[#0C1D32] text-lg font-medium text-left"
            >
              Funkciók
            </button>
            <button
              onClick={() => { scrollToSection(missionRef); setMenuOpen(false); }}
              className="text-[#0C1D32] text-lg font-medium text-left"
            >
              Küldetés
            </button>
            <button
              onClick={() => { scrollToSection(newsletterRef); setMenuOpen(false); }}
              className="text-[#0C1D32] text-lg font-medium text-left"
            >
              Hírlevél
            </button>
            <Link
              href="/rolunk"
              className="text-[#0C1D32] text-lg font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Rólunk
            </Link>
              <a
                href="https://mobilien.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center rounded-xl bg-black text-white px-4 py-2 text-base font-semibold hover:text-[#069ca8] transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-[#007AAD]/30"
                onClick={() => setMenuOpen(false)}
              >
                Irány az app
              </a>
          </nav>
        )}
      </header>

      {/* Hero Section - Full-width image with overlay content, no spacing */}
      <section className="relative m-0 p-0 h-[400px] md:h-[575px]">
        <div className="relative overflow-hidden h-full">
          <img src="/4.jpg" alt="Hero" className="block w-full h-full object-cover" style={{ objectPosition: 'center top' }} />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0C1D32]/80 via-[#0C1D32]/40 to-transparent"></div>
          <div className="absolute inset-0 flex justify-start items-start pt-16">
            <div className="w-full pl-9 pr-9 md:pl-[54px] md:pr-[54px]">
              {/* Desktop: Original content */}
              <div className="hidden md:block">
                <h1 className="text-white font-extrabold tracking-tight leading-[1.05] text-[clamp(2.25rem,5vw,5.5rem)] max-w-[50ch]">
                  Az All-in-One<br />
                  EV Töltő Megoldás
                </h1>
              </div>
              <div className="hidden md:grid md:grid-cols-3 gap-8 lg:gap-12 mt-44">
                <div className="text-white">
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Töltőkeresés egyszerűen</h3>
                  <p className="text-white/90 text-sm md:text-base max-w-sm">Egy alkalmazás, amely összeköti Önt Magyarország összes EV töltőállomásával.</p>
                  <div className="mt-8">
                    <Button size="lg" className="text-white hover:opacity-90" style={{ background: "linear-gradient(135deg,#0066FF,#00C2FF)" }} asChild>
                      <Link href="/kapcsolat">Kapcsolatfelvétel</Link>
                    </Button>
                  </div>
                </div>
                <div className="text-white">
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Dinamikus árazás</h3>
                  <p className="text-white/90 text-sm md:text-base max-w-sm">Használja ki az ármozgásokat, és töltse járművét a legjobb időben, a legalacsonyabb áron.</p>
                </div>
                <div className="text-white">
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Az Ön AI segítője</h3>
                  <p className="text-white/90 text-sm md:text-base max-w-sm">Mobi az Ön személyes AI ügynöke, aki segít eligazodni az e-mobilitás világában. Támogatja a töltéssel, útvonaltervezéssel és költségek optimalizálásával kapcsolatos döntéseiben.</p>
                </div>
              </div>
              
              {/* Mobile: Simplified content */}
              <div className="md:hidden">
                <h1 className="text-white font-bold text-3xl mb-16">
                  Az e-mobilitás világában, könnyedén.
                </h1>
                <p className="text-white/90 text-base mb-4">
                  Tedd egyszerűbbé az e-autózást – egy intelligens alkalmazással és segítőkész AI-asszisztenssel, aki veled tart az úton.
                </p>
                <a
                  href="https://mobilien.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-xl text-white px-6 py-3 text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30 shadow-md shadow-blue-500/20"
                  style={{ background: "linear-gradient(to bottom right, #3b82f6, #06b6d4)" }}
                >
                  Irány az app
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chat Panel with animated gradient background */}
      <section className="py-0">
        <AIChatPanel />
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-20 bg-[#FFFBFC]">
        <div className="w-full pl-9 pr-9 md:pl-[54px] md:pr-[54px]">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0C1D32] mb-4">
              Válasz az e-mobilitási problémáira:
            </h2>
            <p className="text-[#0C1D32]/70 max-w-2xl mx-auto">
              A Mobilien összekapcsolja az ország összes töltőjét AI-alapú segítséggel. Foglaljon, töltsön és spóroljon – mindezt egyetlen alkalmazásból.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="bg-[#007AAD]/10 p-3 rounded-full h-fit">
                    <Map className="h-6 w-6 text-[#007AAD]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0C1D32] mb-2">
                      All-in-One Platform
                    </h3>
                    <p className="text-[#0C1D32]/70">
                      Fedezze fel Magyarország összes nyilvános töltőállomását egyetlen, intuitív alkalmazásban.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-[#007AAD]/10 p-3 rounded-full h-fit">
                    <DollarSign className="h-6 w-6 text-[#007AAD]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0C1D32] mb-2">
                      Dinamikus árazás
                    </h3>
                    <p className="text-[#0C1D32]/70">
                      Töltsön kedvezőbb áron az alkalmazásban megjelölt időszakokban és töltőpontokon.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-[#007AAD]/10 p-3 rounded-full h-fit">
                    <Route className="h-6 w-6 text-[#007AAD]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0C1D32] mb-2">
                      Intelligens útvonaltervezés
                    </h3>
                    <p className="text-[#0C1D32]/70">
                      Beépített, költség- és időoptimalizált MI-alapú útvonaltervezés valós idejű adatok és egyéni vezetési szokások alapján, költségbecsléssel kiegészítve.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-[#007AAD]/10 p-3 rounded-full h-fit">
                    <Bot className="h-6 w-6 text-[#007AAD]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0C1D32] mb-2">
                      Az Ön e-mobilitási AI asszisztense – „Mobi"
                    </h3>
                    <p className="text-[#0C1D32]/70">
                      Kapjon személyre szabott útmutatást és valós idejű támogatást a magyar elektromos jármű-infrastruktúrára és iparági ismeretekre kiképzett MI-asszisztensünktől.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2 relative h-[500px] rounded-lg overflow-hidden">
              <div className="w-full h-full">
                <img 
                  src="/2.png" 
                  alt="Mobilien Megoldás" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Mission Section */}
      <section ref={missionRef} id="mission" className="py-20 bg-[#D9E2E9]/30">
        <div className="w-full pl-9 pr-9 md:pl-[54px] md:pr-[54px]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0C1D32] mb-6">
              Tudj meg többet a dinamikus árazásról
            </h2>
            <p className="text-[#0C1D32]/70 text-lg mb-8">
              Növelje forgalmát és használja ki az energiaárak változásait dinamikus árazással!
              Az aktuális energiaárakhoz igazodó díjszabás lehetővé teszi, hogy alacsony árú időszakokban kedvezőbb tarifákat kínáljon, ezzel több ügyfelet vonzva töltőpontjaihoz.
              A dinamikus árazás nemcsak a bevételt növeli, hanem javítja a töltők kihasználtságát és elősegíti a fenntartható működést is.
            </p>
            <div className="flex flex-col items-center gap-24 mt-12 mb-24">
              <img src="/3.png" alt="Dinamikus árazás" className="w-full max-w-[28rem] md:max-w-[32rem] object-cover rounded-xl shadow-lg" style={{ transform: 'scale(1.05)' }} />
              <img src="/mobilienapp3.png" alt="Mobilien App 3" className="w-full max-w-[24rem] md:max-w-[56rem] object-cover rounded-xl shadow-lg" style={{ transform: 'scale(1.1)' }} />
            </div>
            <div className="flex justify-center mt-8">
              <Button
                size="lg"
                className="text-white hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#0066FF,#00C2FF)" }}
                onClick={() => { window.location.href = '/kapcsolat'; }}
              >
                Kapcsolatfelvétel
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}

      {/* Newsletter Section */}
      <section
        ref={newsletterRef}
        id="newsletter"
        className="py-20"
        style={{ backgroundColor: '#000518' }}
      >
        <div className="w-full pl-9 pr-9 md:pl-[54px] md:pr-[54px]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#FFFBFC] mb-4">
              Maradj Naprakész
            </h2>
            <p className="text-[#D9E2E9] mb-8">
              Légy az első, aki értesül a Mobilien hírleveléről, frissítésekről és kapj
              exkluzív betekintést a cég, valamint a fejlesztés kulisszái mögé!
            </p>
            <NewsletterForm />
            <p className="text-[#D9E2E9]/70 text-sm mt-4">
            
              {/* Privacy notice and unsubscribe sentence removed as requested */}
              <br />
              <span className="block mt-4 whitespace-pre-line">
                Mobilien Technologies Kft.<br />
                1021 Budapest, Budakeszi út 27.<br />
                Adószám: 32893669-2-41<br />
                Cégjegyzékszám: 01-09-448178<br />
                E-mail: info@mobilien.hu<br />
                Telefon: +36 30 382 9448 (PR Iroda)

              </span>
            </p>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-[#007AAD]/20" style={{ backgroundColor: '#000518' }}>
        <div className="w-full pl-9 pr-9 md:pl-[54px] md:pr-[54px]">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-1 mb-4 md:mb-0">
              <img
                src="/mobilien5.png"
                width={36}
                height={36}
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
