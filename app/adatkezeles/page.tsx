import Link from "next/link";

export default function AdatkezelesPage() {
  return (
    <main className="min-h-[60vh] bg-[#FFFBFC]">
      <section className="py-24">
        <div className="container max-w-2xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0C1D32] mb-4">Adatkezelési tájékoztató</h1>
          <p className="text-[#0C1D32]/80 mb-8">
            Kérjük, olvasd el az adatkezelési irányelveinket az alábbi oldalon.
          </p>
          <Link href="/privacy-policy" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#007AAD] text-white hover:bg-[#007AAD]/90">
            Ugrás az adatvédelmi szabályzatra
          </Link>
        </div>
      </section>
    </main>
  );
}


