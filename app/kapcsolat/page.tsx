"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type FormState = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const router = useRouter();
  const [state, setState] = useState<FormState>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    company: "",
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    accepted: false,
  });

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Kötelező mező";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Érvényes e-mail címet adj meg";
    if (!form.subject.trim()) e.subject = "Kötelező mező";
    if (!form.message || form.message.trim().length < 10) e.message = "Legalább 10 karakter";
    if (!form.accepted) e.accepted = "Az adatkezelési tájékoztató elfogadása kötelező";
    if (form.phone && !/^[0-9+()\-\s]{6,}$/.test(form.phone)) e.phone = "Érvénytelen telefonszám";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setState("submitting");
    try {
      const res = await fetch("https://api.mobilien.app/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: form.company || undefined,
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          subject: form.subject,
          message: form.message,
        }),
      });
      if (!res.ok) throw new Error("send_failed");
      setState("success");
    } catch (_) {
      setState("error");
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFBFC]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#D9E2E9] bg-[#FFFBFC]/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-1">
            <img
              src="/mobilien5.png"
              width={36}
              height={36}
              alt="Mobilien Logo"
            />
            <span className="text-xl font-bold text-[#0C1D32]">Mobilien</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-[#0C1D32] hover:text-[#007AAD] transition-colors"
            >
              Vissza a főoldalra
            </Link>
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/"
              className="text-[#0C1D32] hover:text-[#007AAD] transition-colors text-sm"
            >
              Vissza
            </Link>
          </div>
        </div>
      </header>

      <main className="min-h-screen" style={{ background: "linear-gradient(180deg,#F9FAFB, #FFFFFF)" }}>
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto w-full max-w-[720px]">
              <header className="text-center mb-8 md:mb-12">
                <h1 className="text-3xl md:text-[36px] font-bold text-[#0C1D32]">Kapcsolatfelvétel</h1>
                <p className="text-[18px] text-[#0C1D32]/70 mt-3">Vedd fel velünk a kapcsolatot az alábbi űrlapon keresztül.</p>
              </header>

              {state === "error" && (
                <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 animate-[fade-in_200ms_ease]">
                  Sikertelen küldés, kérlek próbáld újra később.
                </div>
              )}

              {state !== "success" ? (
                <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-[0_8px_24px_rgba(12,24,40,0.12)] p-5 md:p-8">
                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-[#0C1D32]">Cégnév <span className="text-[#0C1D32]/50 font-normal">(opcionális)</span></label>
                      <input id="company" className={`mt-2 w-full rounded-[10px] border ${errors.company ? "border-red-400" : "border-[#E5E7EB]"} p-3 focus:outline-none focus:ring-4 focus:ring-[#0066FF]/20 focus:border-[#0066FF]`} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} aria-invalid={!!errors.company} />
                      {errors.company && <p role="alert" className="mt-1 text-[13px] text-red-600">{errors.company}</p>}
                    </div>

                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-[#0C1D32]">Név</label>
                      <input id="name" required className={`mt-2 w-full rounded-[10px] border ${errors.name ? "border-red-400" : "border-[#E5E7EB]"} p-3 focus:outline-none focus:ring-4 focus:ring-[#0066FF]/20 focus:border-[#0066FF]`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={!!errors.name} />
                      {errors.name && <p role="alert" className="mt-1 text-[13px] text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[#0C1D32]">E-mail cím</label>
                      <input id="email" type="email" required className={`mt-2 w-full rounded-[10px] border ${errors.email ? "border-red-400" : "border-[#E5E7EB]"} p-3 focus:outline-none focus:ring-4 focus:ring-[#0066FF]/20 focus:border-[#0066FF]`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-invalid={!!errors.email} />
                      <p className="mt-1 text-xs text-gray-500">Csak válaszadás céljából használjuk.</p>
                      {errors.email && <p role="alert" className="mt-1 text-[13px] text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-[#0C1D32]">Telefonszám <span className="text-[#0C1D32]/50 font-normal">(opcionális)</span></label>
                      <input id="phone" type="tel" className={`mt-2 w-full rounded-[10px] border ${errors.phone ? "border-red-400" : "border-[#E5E7EB]"} p-3 focus:outline-none focus:ring-4 focus:ring-[#0066FF]/20 focus:border-[#0066FF]`} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} aria-invalid={!!errors.phone} />
                      {errors.phone && <p role="alert" className="mt-1 text-[13px] text-red-600">{errors.phone}</p>}
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-[#0C1D32]">Tárgy</label>
                      <input id="subject" required className={`mt-2 w-full rounded-[10px] border ${errors.subject ? "border-red-400" : "border-[#E5E7EB]"} p-3 focus:outline-none focus:ring-4 focus:ring-[#0066FF]/20 focus:border-[#0066FF]`} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} aria-invalid={!!errors.subject} />
                      {errors.subject && <p role="alert" className="mt-1 text-[13px] text-red-600">{errors.subject}</p>}
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-[#0C1D32]">Üzenet</label>
                      <textarea id="message" rows={6} required className={`mt-2 w-full rounded-[10px] border ${errors.message ? "border-red-400" : "border-[#E5E7EB]"} p-3 focus:outline-none focus:ring-4 focus:ring-[#0066FF]/20 focus:border-[#0066FF]`} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} aria-invalid={!!errors.message} />
                      {errors.message && <p role="alert" className="mt-1 text-[13px] text-red-600">{errors.message}</p>}
                    </div>

                    <div className="flex items-start gap-3">
                      <input id="accepted" type="checkbox" checked={form.accepted} onChange={(e) => setForm({ ...form, accepted: e.target.checked })} aria-invalid={!!errors.accepted} className="mt-1" />
                      <label htmlFor="accepted" className="text-sm text-[#0C1D32]">
                        Elfogadom az <a href="/adatkezeles" className="text-[#0066FF] underline">adatkezelési tájékoztatót</a>
                      </label>
                    </div>
                    {errors.accepted && <p role="alert" className="-mt-3 text-[13px] text-red-600">{errors.accepted}</p>}

                    <button type="submit" disabled={state === "submitting"} className="w-full py-3 rounded-xl text-white text-[16px] transition disabled:opacity-60" style={{ background: "linear-gradient(135deg,#0066FF,#00C2FF)" }}>
                      {state === "submitting" ? "Küldés..." : "Üzenet küldése"}
                    </button>
                  </div>
                </form>
              ) : (
                <div role="alert" className="bg-white rounded-xl shadow-[0_8px_24px_rgba(12,24,40,0.12)] p-8 text-center animate-[fade-in_200ms_ease]">
                  <h2 className="text-2xl font-semibold text-[#0C1D32] mb-2">Köszönjük, üzenetedet megkaptuk!</h2>
                  <p className="text-[#0C1D32]/70 mb-6">Hamarosan válaszolunk az általad megadott e-mail címre.</p>
                  <button onClick={() => router.push('/')} className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#007AAD] text-white hover:bg-[#007AAD]/90">Vissza a kezdőlapra</button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
