"use client";
import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setMounted(true);
    const saved = window.localStorage.getItem("cookieConsent");
    if (!saved) setShow(true);
  }, []);

  function setConsent(value: "all" | "necessary") {
    try { window.localStorage.setItem("cookieConsent", value); } catch {}
    setShow(false);
  }

  if (!mounted || !show) return null;

  return (
    <div role="dialog" aria-live="polite" className="fixed left-4 bottom-4 z-[9999] pointer-events-none animate-[slideUp_.6s_ease-out_forwards]">
      <div className="pointer-events-auto w-[min(400px,90vw)] rounded-xl border border-[#D9E2E9] shadow-[0_12px_32px_rgba(12,24,40,.16)] px-4 py-4" style={{ backgroundColor: '#f4f3f6' }}>
        <p className="text-[14px] leading-relaxed text-[#0C1D32]/70 m-0 mb-4">
          Ez a weboldal sütiket (cookie-kat) használ a felhasználói élmény javítása, a forgalom elemzése és a szolgáltatások testreszabása érdekében.
          A sütik egy része a weboldal megfelelő működéséhez szükséges, mások statisztikai vagy marketing célokat szolgálnak.
          Kérjük, válaszd ki, hogy elfogadod-e az összes sütit, vagy csak a szükségeseket engedélyezed.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setConsent("all")}
            className="rounded-[10px] px-4 py-2 text-white font-semibold hover:opacity-90 transition-opacity bg-black"
          >
            Elfogadom az összeset
          </button>
          <button
            onClick={() => setConsent("necessary")}
            className="rounded-[10px] px-4 py-2 font-semibold text-[#0C1D32] border border-[#D9E2E9] hover:bg-[#D9E2E9]/25 transition-colors bg-white"
          >
            Csak a szükségeseket engedélyezem
          </button>
          <button
            onClick={() => setConsent("necessary")}
            className="rounded-[10px] px-4 py-2 font-semibold text-[#0C1D32] border border-[#D9E2E9] hover:bg-[#D9E2E9]/25 transition-colors bg-white"
          >
            Sütik letiltása
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(100px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}


