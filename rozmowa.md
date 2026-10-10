# ROZMOWA — dziennik projektu i punkt wznowienia pracy

> Aktualizacja: 2026-10-10 (Europe/Warsaw). Projekt: **RozdzielnicaPRO.pl**, repozytorium `maxstudiopl/elektryk`, gałąź produkcyjna `main`.
> To **uporządkowany zapis ustaleń i postępu**, nie dosłowny stenogram wszystkich wiadomości. Nie należy wklejać tu haseł, danych użytkowników ani innych sekretów — repozytorium jest publiczne.

## 1. Jak wrócić do projektu w nowym czacie

Wklej: **„Pracujemy nad `maxstudiopl/elektryk`. Przeczytaj plik `rozmowa.md` oraz aktualny `README.md`, sprawdź najnowszy commit, otwarte PR i GitHub Actions. Kontynuuj od ostatniego wpisu w `rozmowa.md`, zachowaj istniejące funkcje i po każdej zakończonej pracy zaktualizuj ten dziennik.”**

Najważniejsza zasada: **źródłem prawdy o faktycznie wdrożonym stanie są pliki w `main`, commity i testy GitHub Actions**, a nie sama numeracja wersji w rozmowie. Sprawdź aktualny `main` przed kolejną zmianą.

## 2. Cel i uzgodnione granice

- **Gra edukacyjna:** symulator budowy rozdzielnic, montaż aparatury DIN, tworzenie przewodów i mostków, diagnozowanie błędów, nauka i egzaminy.
- Marka własna **PRO** (nie „XYZ”, nie nazwy producentów jako etykiety produktów).
- Rozdzielnice mieszkaniowe, duże/XL i przemysłowe (hale produkcyjne); listwy zaciskowe **X1/ZUG** w przemysłowych.
- Duża liczba przewodów, rozpoznawalne zakończenia i identyfikacja, właściwe barwy L1/L2/L3/N/PE. W poprzednich ustaleniach wskazywano cel około **50–70 kabli maksymalnie** — nie traktuj tego jako obecnie przetestowanej pojemności.
- Panel Użytkownika: **Wolna Budowa, Nauka, Rozdzielnice Przemysłowe, Egzamin**; katalog **300 zadań** i postępy XP.
- Dopracowane panele, schematy, pomoc, diagnostyka, responsywność, wygląd i użyteczność aparatów PRO.
- **AI odłożone do wersji 2.0**; teraz rozwijamy solidny podstawowy symulator.
- Realne schematy/połączenia i ocena w grze mają charakter **dydaktyczny**: nie certyfikują instalacji, nie zastępują projektu, kontroli pomiarowej, norm, odbioru przez osobę uprawnioną.
- Wprowadzaj poprawki **bez regresji** w działających trybach, geometrii zacisków, zapisach, kontach i naliczaniu XP. Testy Node + Chromium przed scaleniem. Nie przedstawiaj nietestowanych funkcji jako wdrożonych.

## 3. Historia ustaleń i etapów (rekonstrukcja ze starszych rozmów oraz README)

- **v0.2–0.5:** podstawowy silnik połączeń L/N/PE, FR, RCD, MCB, odbiorniki, diagnostyka, postępy.
- **v0.7.12–v0.7.13:** panel użytkownika, Hardware PRO, Wiring PRO, Routing PRO, Assembly PRO; audyt elektryczny, kontrola RCD i N; DEMO.
- **v0.7.15.2.1:** poprawki prowadzenia i identyfikacji przewodów.
- **v0.7.15.3:** przejście z XYZ na markę PRO.
- **v0.7.16 / .1 / .2:** przemysłowe **4×24 (96M, X1 24 pozycje)** i **5×24 (120M, X1 30 pozycji)**; narzędzia montażu ZUG, zapis w slotach, wygląd szaf produkcyjnych i hotfix widoczności N.
- **v0.7.17–.17.5:** odświeżenie stanowiska i paneli, Nauka 2.0, narzędzia nad większą rozdzielnicą, poprawki górnych wyjść i wybór obudowy.
- **v0.7.17.6:** katalog 300 zadań z wyszukiwaniem i filtrami.
- **v0.7.17.7–.17.7.1:** pomoc, schematy, szczegółowy raport instalacji, niezależny scroll bocznych paneli.
- **v0.7.18:** bardziej realistyczne aparaty PRO bez zmiany punktów połączeń.
- **v0.7.19:** trzy kolumny desktop, dwa panele pod stanowiskiem na tablecie, ekran mobilny i ograniczenie zbędnych przerysowań.
- **v0.7.20:** kontrola jakości, stabilizacja montażu, przewodów, zapisu projektów, wyszukiwania zadań i testów przeglądarkowych.
- **v0.7.20.1, 2026-10-10, PR #2 scalony:** raport unieważniany po zmianie obudowy lub układu X1; **brak pełnego „zaliczenia” przemysłowego X1**, ponieważ zaciski nie uczestniczą jeszcze w modelu elektrycznym; testy Node/Chromium przeszły. Commit `3bc51403`.

Historia szczegółowa znajduje się także w `README.md` i zakładce „Aktualizacje” w grze. Nie należy kopiować poprzednich obszernych czatów jako rzekomego dosłownego stenogramu.

## 4. Fakty techniczne / orientacja w kodzie

- Gra WWW: statyczny HTML/CSS/JS; **`index.html`**, moduły ładowane przez **`auth-v050.js`**.
- Definicje obudów: **`switchboard-db.js`** (7 aktywnych szablonów, plus planowany budowlany).
- Rozmiar i montaż: **`enclosure-v078.js`**, **`stage2.js`**.
- Zaciski, przewody, widoczne ścieżki: **`stage3.js`**, **`cable-routing-v07152.js`**; mostki: **`bridges-v031.js`**.
- Analiza: **`stage4.js`**, **`electrical-engine-v0713.js`**, **`electrical-audit-v0712.js`**, **`rcd-diagnostic-v07131.js`**, raport **`verification-pro-v07177.js`**.
- Listwa przemysłowa X1: **`industrial-zug-v0716.js`**; od v0.7.22 posiada porty T/B, przewody i edukacyjną diagnostykę grafową. Nie wolno mylić walidacji w grze z realnymi pomiarami instalacji.
- Zapisy Wolnej Budowy: **`freebuild-save-v0711.js`**, trzy sloty, `localStorage`, zapis wyłącznie na żądanie użytkownika (brak niejawnego nadpisania przy zamykaniu).
- Testy Node: `node --test tests/*.test.mjs`. Chromium/Playwright: konfiguracja `playwright.config.mjs` i `tests/browser-smoke-v0720.spec.mjs`.
- CI: `.github/workflows/quality.yml`; strona: **https://maxstudiopl.github.io/elektryk/**.
- Wersja Windows: **wybrano pełny instalator offline z automatycznymi aktualizacjami**, niezależny od WWW. W repozytorium istnieje **PR #1 — „Plan: RozdzielnicaPRO Windows offline + automatyczne aktualizacje”**; sprawdzić PR przed wykonaniem, nie uznawać planu za gotowy instalator.

## 5. Dziennik rozmów, decyzji i prac — nowsze wpisy na dole

### 2026-10-10 — kontynuacja po zmianie czatu

**Użytkownik:** poprosił o kontynuację w dziale Elektryk na podstawie wcześniejszej rozmowy i repozytorium, przekazał link do poprzedniego czatu: https://chatgpt.com/share/6aca6558-2dd0-83ed-bde7-e77ab0aaa927 .

**Weryfikacja:** repo `maxstudiopl/elektryk`, najnowszy wtedy `v0.7.20`, pozytywne workflow i Pages.

**Wykonano:** poprawkę v0.7.20.1 przez PR #2, testy i merge do `main`. Powód: raport diagnostyczny nie powinien „zaliczać” X1, którego przewodów silnik nie umie jeszcze badać. Na zmianę szafy lub slotów X1 poprzedni raport musi reagować jako nieaktualny.

**Następny plan z rozmowy:** docelowe podłączenie X1/ZUG do wspólnego grafu elektrycznego i walidacja wejść, wyjść i torów L/N/PE bez drugiego niespójnego silnika.

### 2026-10-10 — prośba o pamięć projektu i pełny audyt

**Użytkownik:** „stworz dodatkowo github plik o nazwie ‘rozmowa’ gdzie bedziesz zapisywał naszą rozmowe by można było zmienić czat rozmowy w razie problemów - zapisuj wszystko co ustalisz itp. Przeanalizuj rozdzielnice czy sa w nich problemy pracuje z pełną mocą + prosze o pełną moc działania”.

**Decyzja wykonawcza:** plik nosi nazwę **`rozmowa.md`** (czytelny Markdown, z nazwą „rozmowa”), umieszczony w katalogu głównym repo. Jest trwałym **dziennikiem i instrukcją wznowienia**, uzupełnianym podczas **kolejnych aktywnych prac z dostępem do repo**. Nie działa jako automatyczny zapis w tle ani kompletna transkrypcja rozmów. W każdym następnym czacie należy go odczytać i uzupełniać o faktyczne ustalenia, PR, testy i nowe problemy. Publiczny plik bez danych poufnych.

**Cel audytu:** zweryfikować integralność danych obudów (wymiary, liczba modułów), rzeczywisty montaż aparatów DIN, wyrównanie zacisków i przewodów po zmianie obudowy, mostki i topologię, ZUG, zapis/odtwarzanie, diagnostykę, Nauka/Egzamin, działanie dla desktop/tablet/telefon. Raportować tylko wyniki potwierdzone kodem lub testem; problemy ujmować z priorytetem i statusem.

## 6. Kontynuacja dziennika — zasady

Po każdej zmianie dopisz datowany wpis z: **żądaniem użytkownika → ustaleniami → zmienionymi plikami → zidentyfikowanymi problemami → testami i ich wynikiem → numerem PR/commitu → statusem wdrożenia → zadaniami otwartymi**.

Pilnuj rozróżnienia:
- **USTALONO** — decyzja, lecz jeszcze niewdrożona;
- **WYKONANO** — realne zmiany zapisane w GitHub;
- **TESTY OK / TESTY NIEPEŁNE / TESTY BŁĘDNE** — faktyczny rezultat;
- **DO ZROBIENIA** — kolejny etap.

Najpierw sprawdź `main`, niezakończone PR, ostatnie workflow i zweryfikuj, czy niniejszy wpis nadal jest aktualny.

### 2026-10-10 — etap v0.7.22 (elektryczna listwa X1)

Ustalenie: dokończyć połączenia X1/ZUG w obu szafach przemysłowych i zachować dotychczasowe tryby gry.

Gałąź robocza: `feat/v0.7.22-x1-electrical`. Zmiany: porty T/B złączek X1, przewody przez istniejący silnik, diagnostyka ciągłości i zasilania, zgodność zapisów oraz testy. Separator nie przewodzi. Szczegóły techniczne w `README.md`. Przed zatwierdzeniem sprawdzić testy CI i odnotować commit wdrożenia.

### 2026-10-10 — ukończone v0.7.22

WYKONANO: połączono zaciski X1/ZUG (port górny i dolny) ze wspólnym grafem symulatora, dodano przewody, kontrolę podłączania i zasilenia zacisków, walidację zapisów, nieprzewodzące separatory oraz testy Node/Chromium. Zapis kompatybilny z dotychczasową listwą. Testy GitHub Actions na PR #5: zaliczone. Zmiany scalone do `main` jako commit `0a44203c472d1ea7851cee7ebeb55b694a6a364c`.

Dodatkowy etap po publikacji: poprawa starych opisów interfejsu, które nadal informowały, że okablowanie X1 jest w przygotowaniu. Prace w gałęzi `chore/v0.7.22-x1-finish`. W razie kolejnego czatu zweryfikować aktualny status tej poprawki oraz ostatni wynik GitHub Actions.
