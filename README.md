# RozdzielnicaPRO.pl — Symulator Budowy Rozdzielnic

Przeglądarkowy symulator szkoleniowy montażu aparatury modułowej PRO i okablowania rozdzielnic. Projekt statyczny (HTML, CSS, JavaScript), uruchamiany w przeglądarce.

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
