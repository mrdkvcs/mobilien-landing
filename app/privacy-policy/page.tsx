import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#FFFBFC]">
      <div className="container py-8 md:py-12">
        <Link
          href="/"
          className="inline-flex items-center text-[#007AAD] hover:text-[#007AAD]/80 mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Vissza a főoldalra
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-[#0C1D32]">
              Adatvédelmi Szabályzat
            </h1>
            <a
              href="/Mobilien%20%C3%81SZF.pdf"
              download
              className="inline-block px-6 py-2 bg-[#007AAD] text-white font-semibold rounded-md shadow hover:bg-[#005f87] transition-colors text-base whitespace-nowrap"
              style={{ minWidth: '170px', textAlign: 'center' }}
            >
              ÁSZF Letöltése
            </a>
          </div>

          <div className="prose prose-lg max-w-none text-[#0C1D32]/80">
            <p className="text-lg">
              Utolsó frissítés:{" "}
              {new Date().toLocaleDateString("hu-HU", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <h2 className="text-2xl font-bold text-[#0C1D32] mt-8 mb-4">
              Bevezetés
            </h2>
            <p>
              A Mobilien ("mi", "minket" vagy "miénk") elkötelezett az Ön
              személyes adatainak védelme mellett. Ez az adatvédelmi szabályzat
              ismerteti, hogy milyen adatokat gyűjtünk, hogyan használjuk fel
              azokat, és milyen jogai vannak Önnek az adataival kapcsolatban.
            </p>

            <h2 className="text-2xl font-bold text-[#0C1D32] mt-8 mb-4">
              Milyen adatokat gyűjtünk?
            </h2>
            <p>
              Amikor feliratkozik a hírlevelünkre, a következő adatokat
              gyűjtjük:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Email cím (kötelező)</li>
              <li>Név (opcionális)</li>
              <li>Feliratkozás időpontja</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#0C1D32] mt-8 mb-4">
              Hogyan használjuk fel az adatokat?
            </h2>
            <p>
              Az Ön által megadott adatokat a következő célokra használjuk fel:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>
                Hírlevelek és frissítések küldése a Mobilien szolgáltatásairól
              </li>
              <li>Tájékoztatás új funkciókról, eseményekről és ajánlatokról</li>
              <li>A szolgáltatásaink fejlesztése és személyre szabása</li>
              <li>Kapcsolattartás Önnel, ha kérdése vagy problémája van</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#0C1D32] mt-8 mb-4">
              Adattárolás és biztonság
            </h2>
            <p>
              Az Ön adatait biztonságos szervereken tároljuk, és megfelelő
              technikai és szervezeti intézkedéseket alkalmazunk az adatok
              védelme érdekében. Az adatokat csak addig tároljuk, amíg az a fent
              említett célok eléréséhez szükséges, vagy amíg Ön nem kéri az
              adatai törlését.
            </p>

            <h2 className="text-2xl font-bold text-[#0C1D32] mt-8 mb-4">
              Adatmegosztás harmadik felekkel
            </h2>
            <p>
              Nem adjuk el, nem cseréljük el és nem adjuk bérbe az Ön személyes
              adatait harmadik feleknek. Az adatokat csak a következő esetekben
              osztjuk meg:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Ha Ön ehhez kifejezetten hozzájárult</li>
              <li>Ha ez jogi kötelezettségeink teljesítéséhez szükséges</li>
              <li>
                Szolgáltatóinkkal, akik segítenek nekünk a szolgáltatásaink
                nyújtásában (pl. email szolgáltatók)
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-[#0C1D32] mt-8 mb-4">
              Az Ön jogai
            </h2>
            <p>Az adatvédelmi jogszabályok értelmében Önnek jogában áll:</p>
            <ul className="list-disc pl-6 mb-6">
              <li>Hozzáférni az Önről tárolt adatokhoz</li>
              <li>Kérni az adatai helyesbítését, ha azok pontatlanok</li>
              <li>Kérni az adatai törlését</li>
              <li>Korlátozni vagy tiltakozni az adatai feldolgozása ellen</li>
              <li>Kérni az adatai hordozhatóságát</li>
              <li>Visszavonni a hozzájárulását bármikor</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#0C1D32] mt-8 mb-4">
              Leiratkozás
            </h2>
            <p>
              Bármikor leiratkozhat a hírlevelünkről a hírlevelekben található
              "Leiratkozás" linkre kattintva, vagy közvetlenül kapcsolatba lépve
              velünk az alábbi elérhetőségeken.
            </p>

            <h2 className="text-2xl font-bold text-[#0C1D32] mt-8 mb-4">
              Cookie-k és nyomkövetés
            </h2>
            <p>
              Weboldalunk cookie-kat és hasonló technológiákat használhat a
              felhasználói élmény javítása és a weboldal használatának elemzése
              céljából. Ezekről részletesebb információt a Cookie
              Szabályzatunkban talál.
            </p>

            <h2 className="text-2xl font-bold text-[#0C1D32] mt-8 mb-4">
              Változtatások az adatvédelmi szabályzatban
            </h2>
            <p>
              Időről időre frissíthetjük ezt az adatvédelmi szabályzatot. A
              legutóbbi frissítés dátumát a dokumentum elején találja. Az
              esetleges változtatásokról értesítjük Önt.
            </p>

            <h2 className="text-2xl font-bold text-[#0C1D32] mt-8 mb-4">
              Kapcsolat
            </h2>
            <p>
              Ha bármilyen kérdése vagy aggálya van az adatvédelmi
              szabályzatunkkal kapcsolatban, kérjük, vegye fel velünk a
              kapcsolatot:
            </p>
            <p className="mb-6">
              Email: info@mobilien.hu
              <br />
              Cím: 1021 Budapest, Budakeszi Út
            </p>

            <h2 className="text-2xl font-bold text-[#0C1D32] mt-8 mb-4">
              Jogi megfelelés
            </h2>
            <p>
              Ez az adatvédelmi szabályzat összhangban van az Európai Unió
              Általános Adatvédelmi Rendeletével (GDPR) és a magyar adatvédelmi
              jogszabályokkal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
