# RozdzielnicaPRO — plan aplikacji Windows offline i automatycznych aktualizacji

Status: **PLAN / BEZ WDROŻENIA**  
Repozytorium: `maxstudiopl/elektryk`  
Bazowa wersja przeglądarkowa w chwili analizy: **v0.7.17.1** (2026-10-10)

## 1. Cel i założenia

- Udostępnić pełnoprawną aplikację Windows 10/11 x64, instalowaną przez plik `.exe`, z ikoną, menu i skrótem.
- Wszystkie tryby symulatora (Wolna Budowa, Nauka, Egzamin, Rozdzielnice Przemysłowe) mają działać po instalacji **bez połączenia z internetem**.
- Aktualizacje aplikacji są pobierane przez internet, ale brak sieci nie blokuje uruchomienia ani pracy.
- Zachować równoległy rozwój GitHub Pages pod https://maxstudiopl.github.io/elektryk/ bez regresji.
- Nie resetować zapisanych rozdzielnic, XP, egzaminów, kont lokalnych ani ustawień podczas aktualizacji.
- Publikacja nowej wersji desktopowej wymaga zatwierdzonego wydania; **nie** następuje automatycznie po każdym commicie do `main`.

## 2. Wynik audytu repozytorium

- Projekt to statyczny HTML, CSS i JavaScript, z głównym `index.html`. Brak obecnie katalogu Electron, `package.json` i `.github/workflows`.
- `auth-v050.js`: sesja, ustawienia i stan aplikacji zapisują się w `localStorage`; login korzysta z Web Crypto `crypto.subtle`; moduły gry doładowywane są jako skrypty.
- `accounts-v0711.js`: użytkownicy, administracja i statusy licencji są obsługiwane lokalnie; kod zawiera wbudowane profile testowe. **To nie jest bezpieczny system egzekwowania komercyjnych licencji** i nie należy go tak reklamować.
- `freebuild-save-v0711.js` zapisuje projekty lokalnie i utrzymuje trzy sloty; `progress-v060.js` zapisuje XP i wyniki lokalnie.
- `index.html` ładuje fonty z Google Fonts. Offline trzeba je udostępnić lokalnie, zgodnie z licencją fontów, lub użyć dostępnych lokalnych zamienników.
- `site.webmanifest` służy PWA, ale nie zastępuje instalatora desktopowego.
- Przeniesienie danych z domeny GitHub Pages do oddzielnej aplikacji **nie jest automatyczne** z uwagi na odrębne origin i profil przechowywania.

## 3. Architektura docelowa

**Wspólny kod:** dotychczasowe pliki gry w katalogu głównym.  
**Desktop:** Electron (proces main, bezpieczny preload, osobny updater) oraz `electron-builder` + `electron-updater`.  
**Instalacja:** pakiet NSIS `.exe` per-user, architektura x64; z możliwością rozbudowy później.  
**Źródło aktualizacji:** publiczne GitHub Releases tego samego repozytorium.  
**Dane:** stały `appId` i `userData`, jedno stabilne origin aplikacji i zgodne migracje schematów.

Sugerowana struktura:

```text
elektryk/
├── index.html
├── *.js, *.css, *.svg
├── references/
├── desktop/
│   ├── main.cjs
│   ├── preload.cjs
│   ├── updater.cjs
│   └── assets/
│       └── icon.ico
├── docs/
│   └── WINDOWS-ROADMAP.md
├── .github/
│   └── workflows/
│       └── windows-release.yml
├── package.json
├── package-lock.json
└── .gitignore
```

W `package.json` zapisać stabilne `appId`, nazwę produktu RozdzielnicaPRO, licencjonowany pakiet plików HTML/CSS/JS/SVG wraz z `references/`, target `nsis`, publikację `github` (owner `maxstudiopl`, repo `elektryk`). Artefakty `dist/` i `node_modules/` ignorować w Git.

W Electron użyć prywatnego lokalnego protokołu aplikacyjnego o stabilnym origin (zarejestrowanego jako standard + secure) zamiast polegać na `file://`. W procesie renderer: `nodeIntegration:false`, `contextIsolation:true`, `sandbox:true`, restrykcyjny CSP, brak niepotrzebnego IPC; blokada nieznanej nawigacji i otwieranie dozwolonych linków zewnętrznych poza aplikacją. Aktualizacje i operacje systemowe wykonywać wyłącznie w procesie main.

## 4. Etapy wdrożenia i kryteria odbioru

### Etap A — izolowany prototyp desktop (bez aktualizacji)
- Dodać `package.json`, szkielet `desktop/`, ikonę Windows i konfigurację NSIS.
- Wczytać lokalny `index.html` i wszystkie zależności przez stabilny, bezpieczny origin.
- Nie edytować silnika elektrycznego ani geometrii rozdzielnic tylko po to, by uruchomić Electron.
- Dodać wyraźny znacznik wariantu desktop przy zachowaniu wspólnego interfejsu.
**Akceptacja:** działający lokalnie program Windows uruchamia wszystkie tryby; GitHub Pages działa bez zmian.

### Etap B — pełna niezależność od internetu
- Spakować wszystkie lokalne skrypty, style, grafiki, zasoby w `references/`; usunąć krytyczną zależność od CDN/Google Fonts.
- Sprawdzić `crypto.subtle`, dynamiczne skrypty, obrazy, logo, okna, raporty, egzaminy, montaż ZUG oraz zapisy.
- Zewnętrzne strony (np. odnośniki marketingowe) otwierać w domyślnej przeglądarce; nie blokować działania przy braku sieci.
**Akceptacja:** po instalacji, odłączeniu internetu i ponownym uruchomieniu symulator działa w 4 trybach.

### Etap C — profile użytkowników, dane i backup
- Zachować stabilną przestrzeń zapisu między wersjami i kontami.
- Przeprowadzić audyt wszystkich kluczy `localStorage` (m.in. konta, sesje, zapisy, XP, ustawienia); ustalić wersje schematów.
- Zaprojektować automatyczne kopie bezpieczeństwa i eksport/import zapisów do pliku JSON z walidacją i bezpiecznym odzyskiwaniem.
- Przygotować migrację danych między **kolejnymi wersjami Windows**, a odrębnie opcjonalny eksport/import z WWW do Windows.
- Zmienić sposób inicjalizacji lokalnego administratora: nie polegać na publicznie osadzonym koncie domyślnym.
- Nie obiecywać odpornego na obejście systemu płatnych licencji w całkowicie offline'owym kliencie; ewentualna licencja offline wymaga oddzielnego projektu aktywacji i podpisów kryptograficznych.
**Akceptacja:** aktualizacja, restart i awaryjne zamknięcie nie kasują postępów ani projektów; import nie może nadpisać danych bez potwierdzenia.

### Etap D — automatyczne budowanie instalatora
- Utworzyć `.github/workflows/windows-release.yml` z uruchomieniem Windows runner, instalacją zależności `npm ci`, testami, budowaniem NSIS i archiwizacją.
- Build testowy uruchamiać dla PR/wybranych zmian, a **publikację GitHub Release** tylko po zatwierdzonym tagu wydania.
- Przygotować instalator `RozdzielnicaPRO-Setup-<version>.exe`.
- Dodać `GITHUB_TOKEN` z minimalnym potrzebnym uprawnieniem `contents:write` do publikacji release; nie wkładać tokenu użytkownika do aplikacji.
**Akceptacja:** po zatwierdzeniu wydania GitHub Actions buduje gotowy instalator bez ręcznej pracy na Windows.

### Etap E — aktualizacje przez GitHub Releases
- W procesie main skonfigurować `electron-updater`, źródło GitHub Releases i aktualizacje dla NSIS.
- Sprawdzać po uruchomieniu, gdy jest internet, oraz okresowo w trakcie pracy (np. co 12 h), unikając zbędnego odpytywania GitHuba.
- Obsłużyć stany: brak sieci, brak aktualizacji, pobieranie, błąd, pobrano, instalacja przy zamknięciu lub po zatwierdzonym restarcie.
- Nie przerywać niezapisanej pracy: dialog i zapis przed restartem instalacyjnym.
- Weryfikować metadane/artefakty zgodnie z wersją updatera; przed komercyjną dystrybucją wdrożyć podpisywanie kodu Windows i sprawdzanie podpisów.
- Nie instalować aktualizacji na podstawie surowych commitów `main`.
**Akceptacja:** instalacja wersji X, publikacja X+1, wykrycie/pobranie/instalacja bez ponownego ręcznego uruchamiania instalatora; dane zachowane.

### Etap F — bezpieczeństwo i testy wydania
- Uruchomić testy czterech trybów, izolacji dostępu, zapisu i migracji, pracy z odłączoną siecią, aktualizacji, błędów aktualizacji oraz regresji strony WWW.
- Przeprowadzić test instalacji dla zwykłego użytkownika Windows (bez administratora, jeśli używany per-user NSIS).
- Sprawdzić aktualizację z ostatniego publicznego wydania, jej zgodność ze schematami i procedurę odzyskania po uszkodzeniu.
- Zaplanować certyfikat podpisu kodu dla wydań udostępnianych innym użytkownikom; build niepodpisany może wywoływać alerty Windows SmartScreen.
**Akceptacja:** pełna lista testów przechodzi przed wydaniem stabilnym.

## 5. Wersjonowanie i publikacja

Wydanie desktop powinno używać standardowego **SemVer** (trzy segmenty) niezależnie od 4-segmentowej etykiety wersji WWW `0.7.17.1`.

Przykładowo:
- Pierwsza wewnętrzna beta desktop: `0.7.18-beta.1`, tag `v0.7.18-beta.1`.
- Następna beta: `0.7.18-beta.2`.
- Wersja stabilna: `0.7.18`, tag `v0.7.18`.

Oddzielić beta i stable tak, by zwykły użytkownik nie dostał przypadkowo wersji testowej. Wydania tworzyć jako publikowane GitHub Releases (draft/prerelease według kanału). Uploader musi dołączyć instalator i wygenerowane metadane aktualizacyjne, m.in. `latest.yml`. Nie zmieniać `appId`, scheme/origin ani publishera bez planu migracji.

## 6. Ryzyka i działania zaradcze

| Ryzyko | Działanie |
|---|---|
| Brak internetu przy uruchomieniu | Aplikacja startuje lokalnie, pomija sprawdzenie aktualizacji |
| Zmiana origin i utrata `localStorage` | Wybór stabilnego origin przed pierwszą betą, migracje i kopie |
| Zapisane projekty w WWW | Osobny eksport/import do aplikacji, bez obietnicy automatycznej synchronizacji |
| Zewnętrzne czcionki i skrypty | Spakować zasoby, test odłączonej sieci |
| Publicznie widoczne konta i role | Audyt bezpieczeństwa, nowe profile lokalne, nie traktować `localStorage` jako licencjonowania |
| Aktualizacja przerywa montaż | Odroczenie instalacji i ochrona niezapisanych zmian |
| Wydanie niepodpisane | Wewnętrzna beta testowa; certyfikat do szerokiej dystrybucji |
| Regresja GitHub Pages | Separacja plików Electron, test WWW w CI |
| Awaria nowej wersji | Zachowanie poprzedniego wydania, eksport/backup, możliwość ręcznej instalacji wcześniejszej wersji zgodnej ze schematem danych |

## 7. Definicja gotowości — Windows v1

- [ ] Instaluje się z `.exe` na Windows 10/11 x64.
- [ ] Uruchamia wszystkie cztery tryby przy odłączonym internecie.
- [ ] Użytkownik może projektować, zapisywać i odczytywać rozdzielnice.
- [ ] Postępy, ustawienia i profile są trwałe po aktualizacjach.
- [ ] Działa eksport i import danych oraz test odzyskiwania po błędzie.
- [ ] Publikacja zatwierdzonego tagu tworzy instalator i GitHub Release.
- [ ] Aplikacja wykrywa, pobiera i instaluje poprawne, zweryfikowane aktualizacje.
- [ ] Niezapisana praca nie zostaje porzucona w trakcie restartu do aktualizacji.
- [ ] Wersja WWW na GitHub Pages przechodzi testy regresji.
- [ ] Bezpieczeństwo Electron i podpisy kodu zweryfikowano przed publicznym wydaniem.

## 8. Zalecana kolejność PR

1. `feat/windows-shell`: uruchomienie lokalnego symulatora w Electron.
2. `feat/windows-offline-assets`: zasoby i pełny test offline.
3. `feat/windows-persistence`: trwałe dane, migracje, kopie i lokalne profile.
4. `ci/windows-build`: niezależny workflow budujący instalator.
5. `feat/windows-auto-updater`: GitHub Releases + aktualizacja w main process.
6. `test/windows-release-hardening`: test aktualizacji, podpisywanie, bezpieczeństwo, dokumentacja obsługi i dystrybucji.

**Uwaga:** ten plik jest planem. Nie oznacza, że instalator, updater ani powyższe testy są już zaimplementowane.

## Dokumentacja referencyjna

- [Electron — Security](https://www.electronjs.org/docs/latest/tutorial/security/)
- [electron-builder v26 — Auto Update](https://www.electron.build/v26/docs/features/auto-update/)
- [electron-builder — GitHub Actions](https://www.electron.build/v26/docs/github-actions/)
