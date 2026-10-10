# RozdzielnicaPRO.pl — Symulator Budowy Rozdzielnic

Przeglądarkowy symulator szkoleniowy montażu aparatury modułowej PRO i okablowania rozdzielnic. Projekt statyczny (HTML, CSS, JavaScript), uruchamiany w przeglądarce.

## v0.7.16.2 — hotfix widoczności listwy N

- Zgłoszenie ze zrzutu ekranu: przemysłowy pasek „PRO • SZAFA PRODUKCYJNA / X1” przykrywał poziomą listwę neutralną N.
- Przyczyna: oryginalna listwa N ma położenie `top:-42px` względem strefy DIN zaczynającej się na `214px` (czyli N = `172px`), a nowy pasek otrzymał `top:170px`.
- Poprawka: pasek informacyjny jest osobnym wierszem w `.workspace`, bezpośrednio pod `.cabinet-head` i **poza** stalową obudową. Nie zmieniono topologii szyny N/PE, identyfikatorów zacisków ani obliczania przewodów.
- Zwiększono wersje query string CSS/JS (07162), by GitHub Pages i przeglądarka pobrały poprawkę.
- Sprawdzono pozycjonowanie źródłowe, składnię JS/CSS i kompletność odwołań do plików. Wizualny test w zalogowanej przeglądarce pozostaje do wykonania.

## v0.7.16.1 — dopracowanie rozdzielnic przemysłowych (etap 2)

- Stalowa obudowa PRO z czytelniejszą ramą, oznaczeniami i niezależnym stylem od rozdzielnic domowych.
- Szyny DIN o metalicznym wyglądzie, oznaczenia R01–R05, kanały kablowe PVC między rzędami i po bokach.
- Górna szyna zaciskowa X1 mieści 24 lub 30 indywidualnie oznaczonych miejsc, bez nakładania się na WLZ.
- Lewy panel ZUG: **Wstaw w pierwsze wolne miejsce** oraz **Przykładowy układ X1** (L1, L2, L3, N, PE, separator); obecne zaciski pozostają na miejscu.
- Zachowana fizyczna geometria istniejących zacisków DIN i silnik połączeń. Nie zmieniono mechaniki Wolnej Budowy ani zapisu projektów.
- Dodatkowe pliki: `industrial-view-v07161.css`, `industrial-view-v07161.js`. Moduł uruchamia się tylko dla rozdzielnic przemysłowych.
- **Uwaga:** X1 nadal jest montażową wizualizacją, nie elektrycznym węzłem do podłączania przewodów; przykładowy układ nie oznacza poprawności połączeń.

### Podgląd i kontrola

Otwórz https://maxstudiopl.github.io/elektryk/ i po zalogowaniu wybierz **Rozdzielnice Przemysłowe**.
Sprawdź układ X1 4×24, dodawanie pojedynczego zacisku oraz przykładowego układu. Następnie zmień obudowę na 5×24 (X1: 30 miejsc), zapisz i wczytaj projekt, a potem przejdź do domowej Wolnej Budowy i sprawdź, czy nakładki przemysłowe zniknęły. Sprawdź także Egzamin i Naukę.
Zmiany w repozytorium przeszły kontrolę składni i test logiki bez testu wizualnego produkcyjnej strony w przeglądarce.

## Panel Użytkownika — wariant B (w ramach v0.7.16)

- Widoczna nazwa **Panel Użytkownika** zamiast dotychczasowego Panelu Gracza.
- Biały nagłówek z oryginalnym logo bez osobnej ramki, a po prawej powitanie zalogowanego użytkownika.
- Trzy kafelki w pierwszym rzędzie: **Wolna Budowa**, **Nauka** i **Rozdzielnice Przemysłowe**.
- **Egzamin** w osobnym, pełnoszerokim rzędzie (10 pytań + 3 zadania praktyczne).
- Statystyki postępów w oddzielnym oknie; zachowane identyfikatory liczników XP, poziomu i zadań.
- **Ustawienia → Moje konto**: licencja, sesja, status płatności i dostęp; **Ustawienia gry**: dotychczasowe opcje interfejsu; **Informacje**: wersja i autor.
- **O symulatorze** i działająca historia aktualizacji jako zakładki informacyjne.
- Ostrzeżenia o niedostępnej licencji widoczne również w panelu użytkownika.
- Responsywność: układ 3+1 na komputerze, 2+1+egzamin na tablecie i układ pionowy na telefonie.
- Nowe pliki: `user-panel-v0716.css`, `user-panel-v0716.js`. Logika kont, zapisów, nauki i egzaminów pozostaje bez zmian.

### Kontrola po aktualizacji

1. Zaloguj się i sprawdź powitanie, biały nagłówek, cztery kafelki w układzie B.
2. Otwórz **Statystyki**, zamknij przyciskiem X, kliknięciem tła oraz Escape.
3. Otwórz **Ustawienia → Moje konto**. Zweryfikuj licencję, czas sesji i status płatności. Sprawdź zakładkę **Ustawienia gry** i zapis opcji.
4. Otwórz **O symulatorze**, przełącz do **Aktualizacji** i wróć do panelu.
5. Uruchom każdy z czterech trybów. Sprawdź działanie przycisku powrotu **Panel Użytkownika**.
6. Sprawdź układ na telefonie, tablecie i desktopie oraz komunikat o wygasłej licencji.

## Wersja v0.7.16 — rozdzielnice przemysłowe PRO (etap 1)

- Nowy przycisk **PRZEMYSŁ • PRO** w panelu gracza, prowadzący do Wolnej Budowy.
- Dwa szablony rozdzielnic produkcyjnych: **4×24 (96 modułów DIN)** oraz **5×24 (120 modułów DIN)**.
- Górna szyna TH35 **X1 / ZUG** obok wprowadzenia WLZ z odpowiednio 24 lub 30 miejscami.
- Montaż pojedynczych zacisków L1, L2, L3, N, PE oraz separatorów sekcji; wybór, usuwanie, cofanie i czyszczenie listwy.
- Oryginalna aparatura **PRO** pozostaje dostępna na szynach DIN przez dotychczasowy katalog.
- Układ X1 jest zapisywany i przywracany w trzech slotach Wolnej Budowy razem z aparatami, połączeniami i mostkami.
- Dotychczasowe rozdzielnice domowe, nauka, egzaminy i tryb DEMO pozostają odrębne; ZUG można montować wyłącznie w przemysłowej Wolnej Budowie po zalogowaniu.

### Jak przetestować

1. Uruchom `index.html` na serwerze statycznym, zaloguj się na zwykłe konto (nie DEMO).
2. W panelu gracza kliknij **PRZEMYSŁ • PRO**.
3. Z katalogu **APARATURA PRO** montuj zabezpieczenia na szynach DIN.
4. W lewym panelu **PRZEMYSŁ • LISTWA ZUG X1** wybierz typ i klikaj miejsca na górnej listwie zaciskowej.
5. Wybierz slot **ZAPIS PROJEKTU** i zapisz. Odśwież, a następnie wczytaj zapis. Sprawdź zarówno ZUG-i, jak i aparaty.
6. Przełącz rozdzielnicę na model domowy: panel i górna listwa ZUG powinny zniknąć.

### Zakres bezpieczeństwa

**v0.7.16 realizuje etap montażowy ZUG.** Górna listwa X1 ma obecnie własny stan i oznaczenia, ale **nie jest jeszcze podłączona do grafu elektrycznego** silnika, nie można jej używać jako potwierdzenia połączenia zasilania, ochrony czy oceny poprawności instalacji. Integrację przewodów wejściowych/wyjściowych, przekrojów, obwodów oraz walidację L/N/PE przewidziano na kolejny etap. Symulator służy do nauki i nie zastępuje projektu wykonawczego, norm ani pomiarów.

## Najważniejsze pliki

- `index.html` — ekran logowania, panel gracza, rozdzielnica i katalog.
- `auth-v050.js` — wejście do trybów i ładowanie skryptów.
- `switchboard-db.js` — definicje szablonów obudów.
- `industrial-zug-v0716.js` — stan, montaż i reset listwy X1.
- `industrial-zug-v0716.css` — wygląd rozdzielnicy przemysłowej i zacisków.
- `freebuild-save-v0711.js` — trzy sloty zapisu, obecnie schemat danych 2.
- `references/` — baza materiałów referencyjnych oraz reguły fikcyjnej marki PRO.

## Plan dalszego rozwoju

Dalsza integracja X1 z trasowaniem przewodów i regułami połączeń przemysłowych powinna wykorzystywać istniejący silnik połączeń, zamiast wprowadzać drugi, niespójny model elektryczny.
