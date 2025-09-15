[1mdiff --git a/app/page.tsx b/app/page.tsx[m
[1mindex c3e682b..6e0224b 100644[m
[1m--- a/app/page.tsx[m
[1m+++ b/app/page.tsx[m
[36m@@ -66,7 +66,7 @@[m [mexport default function Home() {[m
               src="/mobilien5.png"[m
               width={50}[m
               height={50}[m
[31m-              alt="MobiShare Logo"[m
[32m+[m[32m              alt="Mobilien Logo"[m
             />[m
             <span className="text-xl font-bold text-[#0C1D32]">Mobilien</span>[m
           </div>[m
[36m@@ -211,7 +211,7 @@[m [mexport default function Home() {[m
               A Mi Megoldásunk[m
             </h2>[m
             <p className="text-[#0C1D32]/70 max-w-2xl mx-auto">[m
[31m-              A MobiShare egyesíti az összes töltőállomást Magyarországon[m
[32m+[m[32m              A Mobilien egyesíti az összes töltőállomást Magyarországon[m
               megbízható információkkal és MI-alapú funkciókkal.[m
             </p>[m
           </div>[m
[36m@@ -306,7 +306,7 @@[m [mexport default function Home() {[m
               <span className="text-[#007AAD]">Új Kapuja</span>[m
             </h2>[m
             <p className="text-[#0C1D32]/70 max-w-2xl mx-auto">[m
[31m-              Tervezed elektromos járműre váltani? A MobiShare az első lépés a[m
[32m+[m[32m              Tervezed elektromos járműre váltani? A Mobilien az első lépés a[m
               sikeres EV vásárláshoz Magyarországon.[m
             </p>[m
           </div>[m
[36m@@ -362,7 +362,7 @@[m [mexport default function Home() {[m
 [m
               <div className="bg-white p-8 rounded-xl shadow-lg border border-[#D9E2E9] relative z-10">[m
                 <h3 className="text-2xl font-bold text-[#0C1D32] mb-6 text-center">[m
[31m-                  Miért a MobiShare az első lépés az EV vásárláshoz?[m
[32m+[m[32m                  Miért a Mobilien az első lépés az EV vásárláshoz?[m
                 </h3>[m
 [m
                 <ul className="space-y-4">[m
[36m@@ -471,7 +471,7 @@[m [mexport default function Home() {[m
               Küldetésünk[m
             </h2>[m
             <p className="text-xl text-[#0C1D32]/80 mb-8 leading-relaxed">[m
[31m-              A MobiShare-nél elkötelezettek vagyunk Magyarország fenntartható[m
[32m+[m[32m              A Mobilien-nél elkötelezettek vagyunk Magyarország fenntartható[m
               mobilitásra való átállásának felgyorsítása mellett, az elektromos[m
               járművek elterjedésének akadályainak megszüntetésével. Hisszük,[m
               hogy a megbízható információk, a zökkenőmentes hozzáférés és a[m
[36m@@ -505,7 +505,7 @@[m [mexport default function Home() {[m
               Maradj Naprakész[m
             </h2>[m
             <p className="text-[#D9E2E9] mb-8">[m
[31m-              Légy az első, aki értesül a MobiShare indulásáról, és kapj[m
[32m+[m[32m              Légy az első, aki értesül a Mobilien indulásáról, és kapj[m
               exkluzív frissítéseket a fejlődésünkről.[m
             </p>[m
             <NewsletterForm />[m
[36m@@ -530,7 +530,7 @@[m [mexport default function Home() {[m
                 src="/mobilien5.png"[m
                 width={50}[m
                 height={50}[m
[31m-                alt="MobiShare Logo"[m
[32m+[m[32m                alt="Mobilien Logo"[m
               />[m
               <span className="text-lg font-bold text-[#FFFBFC]">Mobilien</span>[m
             </div>[m
[1mdiff --git a/app/privacy-policy/page.tsx b/app/privacy-policy/page.tsx[m
[1mindex d36575f..408f6aa 100644[m
[1m--- a/app/privacy-policy/page.tsx[m
[1m+++ b/app/privacy-policy/page.tsx[m
[36m@@ -32,7 +32,7 @@[m [mexport default function PrivacyPolicy() {[m
               Bevezetés[m
             </h2>[m
             <p>[m
[31m-              A MobiShare ("mi", "minket" vagy "miénk") elkötelezett az Ön[m
[32m+[m[32m              A Mobilien ("mi", "minket" vagy "miénk") elkötelezett az Ön[m
               személyes adatainak védelme mellett. Ez az adatvédelmi szabályzat[m
               ismerteti, hogy milyen adatokat gyűjtünk, hogyan használjuk fel[m
               azokat, és milyen jogai vannak Önnek az adataival kapcsolatban.[m
[36m@@ -59,7 +59,7 @@[m [mexport default function PrivacyPolicy() {[m
             </p>[m
             <ul className="list-disc pl-6 mb-6">[m
               <li>[m
[31m-                Hírlevelek és frissítések küldése a MobiShare szolgáltatásairól[m
[32m+[m[32m                Hírlevelek és frissítések küldése a Mobilien szolgáltatásairól[m
               </li>[m
               <li>Tájékoztatás új funkciókról, eseményekről és ajánlatokról</li>[m
               <li>A szolgáltatásaink fejlesztése és személyre szabása</li>[m
[1mdiff --git a/components/app-interface-3d.tsx b/components/app-interface-3d.tsx[m
[1mindex 0ebd58b..496051d 100644[m
[1m--- a/components/app-interface-3d.tsx[m
[1m+++ b/components/app-interface-3d.tsx[m
[36m@@ -79,7 +79,7 @@[m [mexport default function AppInterface3D() {[m
       ctx.fillStyle = "#FFFFFF"[m
       ctx.font = "bold 40px Arial"[m
       ctx.textAlign = "center"[m
[31m-      ctx.fillText("MobiShare", canvas.width / 2, 60)[m
[32m+[m[32m      ctx.fillText("Mobilien", canvas.width / 2, 60)[m
 [m
       // Map background[m
       ctx.fillStyle = "#D9E2E9"[m
