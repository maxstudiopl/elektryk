# RozdzielnicaPRO.pl — Symulator Budowy Rozdzielnic

Przeglądarkowy symulator szkoleniowy montażu aparatury modułowej PRO i okablowania rozdzielnic. Projekt statyczny (HTML, CSS, JavaScript), uruchamiany w przeglądarce.

## v0.7.17.6 — nowy katalog 300 zadań PRO

Przebudowano katalog zadań szkoleniowych na podstawie dotychczasowego silnika `tasks-v046.js`, `curriculum-v0714.js` i danych użytkownika z `progress-v060.js`. **Zachowano identyfikatory zadań 1–300, schematy, wymagania aparatury i przyznawanie XP**.

- Nowy nagłówek Akademia PRO oraz panel postępów: ukończone zadania, pozostałe zadania, zdobyte XP i pasek realizacji katalogu.
- Filtrowanie wielokryterialne po liczbie szyn DIN (1, 2, 3, Duże/XL), poziomie trudności, statusie **Ukończone / Nieukończone** i połączenie tych filtrów z wyszukiwarką numeru, nazwy, opisu lub aparatury.
- Sortowanie po numerze, liczbie XP lub pierwszeństwie nieukończonych.
- Karty z numerem, poziomem, obudową DIN, wykorzystanymi modułami, XP, aparaturą, stanem zaliczenia i gwiazdkami.
- 12 kart na stronie, sterowanie paginacją i komunikat pustego wyniku; bez tworzenia 300 kart jednocześnie.
- Pasek wyników odświeża się na podstawie **tego samego** zapisu postępów użytkownika, a po zaliczeniu albo resecie profilu katalog otrzymuje zdarzenie `elektryk:progress-updated`. Nie dodano osobnego stanu ukończenia ani ponownego naliczania XP.
- Ulepszono obsługę klawiaturą: widoczne etykiety pól, Escape do zamknięcia katalogu, fokus na wyszukiwarkę i nawigacja TAB.
- Responsywny arkusz `task-catalog-pro-v07176.css` — karty 3 kolumny na desktopie, 2 na tablecie i 1 na telefonie.
- Automatyczne uruchamianie i wznawianie zadania przez `ElektrykTasks.start(id)` nadal działa.
- Test: `node --test tests/task-catalog-v07176.test.mjs` (300 unikalnych zadań, filtrowanie, wyniki XP, uruchomienie zadania, odświeżenie po ukończeniu).

### Sprawdzenie po publikacji

Otwórz https://maxstudiopl.github.io/elektryk/ i wybierz **Nauka → Wybierz zadanie**.
Sprawdź kategorie, wyszukiwarkę (np. „201”, „RCD”), poziomy trudności i sortowanie. Filtr Ukończone będzie użyteczny po zaliczeniu pierwszych zadań. Spróbuj zamknąć okno klawiszem Escape oraz przełączyć strony, uruchomić zadanie i ponownie otworzyć katalog. Potwierdź, że ukończenie zadania aktualizuje postęp, gwiazdki i XP.

Kontrola kodu oraz testy logiki przeszły pozytywnie; wygląd na rzeczywistym ekranie w zalogowanej przeglądarce nadal wymaga weryfikacji.

## v0.7.17.5 — profesjonalny wybór rozdzielnicy (etap 02)

Zmodernizowano ekran **Wolna Budowa → Wybierz rozdzielnicę** bez modyfikowania mechaniki elektrycznej, liczby modułów, zacisków ani projektów zapisanych w przeglądarce.

- Nowe, pełnoekranowo responsywne okno wyboru ze znacznie większymi miniaturami rzeczywistych układów DIN oraz wyraźnymi danymi: rzędy, moduły na rząd i łączna pojemność.
- Wyszukiwanie po nazwie, typie, rozmiarze i oznaczeniu ZUG; rozpoznawane są wymiary z symbolem `×` i literą `x`.
- Filtry rodzin: Wszystkie, Domowe, Duże i Przemysłowe. Dodatkowy filtr liczby modułów: do 36, 37–96 oraz od 97.
- Rozdzielnice przemysłowe mają osobne oznaczenie oraz liczbę pozycji listwy X1. Wyraźnie poinformowano, że okablowanie tej listwy nie jest jeszcze zintegrowane.
- Po wejściu z kafelka **Rozdzielnice Przemysłowe** otwiera się ten sam katalog, ograniczony do dwóch modeli PRO 4×24 i 5×24. Nie wybiera on już automatycznie pierwszej obudowy.
- Podkreślenie modelu aktualnie wybranego, polecanej obudowy i stanu podglądu DEMO.
- Komunikat braku wyników i przycisk czyszczenia filtrów.
- Dostępność: opisane przyciski i etykiety formularzy, Escape do zamknięcia, zarządzanie fokusem i obsługa klawiaturą.
- Nowy styl: `board-selector-pro-v07175.css`, rozszerzony `auth-v050.js`, zaktualizowane `index.html`.
- Test regresyjny: `node --test tests/board-selector-v07175.test.mjs`, m.in. filtrowanie wszystkich 7 wspieranych modeli, rodziny, wyszukiwarka ZUG i 5×24, puste wyniki, ponowne uruchomienie modelu.

### Kontrola w podglądzie

1. Wejdź na https://maxstudiopl.github.io/elektryk/ i wybierz **Wolna Budowa**: sprawdź wszystkie 7 modeli.
2. Filtrowanie: wybierz „Domowe” (2 modele), „Duże” (2 modele), „Przemysłowe” (2 modele) i wypróbuj wyszukiwanie „ZUG” oraz „5×24”.
3. Kliknij **Rozdzielnice Przemysłowe** z Panelu Użytkownika: powinny być do wyboru PRO 4×24 i PRO XL 5×24.
4. Uruchom obudowę, wróć do zmiany modelu, sprawdź podświetlenie aktywnej oraz zachowanie projektu.
5. Przetestuj mobilny widok okna, Escape, TAB, zamknięcie i wznowienie pracy.
6. Potwierdź, że lista ZUG, aparaty DIN, przewody i zapisy projektów nie uległy zmianie.

Testy logiki filtra przeprowadzono na bazie modeli repozytorium. Widok w rzeczywistej, zalogowanej przeglądarce wymaga jeszcze akceptacji po publikacji GitHub Pages.

## v0.7.17.4 — górne wyjścia kablowe O1 / O2

Naprawa zgłoszona na zrzucie ekranu użytkownika: w prawym górnym rogu rozdzielnicy wizualny kierunek rozchodzenia się żył kabla był niezgodny z kierunkiem wprowadzenia kabla od góry.

**Przyczyna:** stary styl `stage3.css` określał `transform-origin:50% 100%` i `rotate(-22deg / +22deg)` dla dolnych kabli. Te reguły częściowo dziedziczyły również górne wyjścia, gdzie płaszcz kabla znajduje się nad żyłami. Nie jest to błąd kolejności zacisków.

**Rozwiązanie:** dodano `cable-routing-top-v07174.css`, wczytywany na końcu arkuszy:
- Górny kabel ma czarną powłokę przy krawędzi górnej, a żyły L / N / PE rozchodzą się **w dół** do oryginalnych zacisków.
- Końcówki żył są zakotwiczone w czarnej powłoce (punkt obrotu na górze, a nie u dołu). L jest wyprowadzona pod kątem 12°, N pionowo, PE pod kątem −12°.
- Wyeliminowano niepożądane obroty całego modelu `rotate(180deg)` dla banku górnego. Nie stosowano `scaleX(-1)` ani odbicia kolorów / kolejności.
- Oryginalne, klikalne zaciski `LOAD:<id>:L/N/PE`, pozycje O1 / O2, pozycje napisów i zasady łączenia pozostają bez zmian.
- Dolny bank, WLZ, szyny DIN, N/PE oraz moduł przemysłowy ZUG pozostają nietknięte.

### Regresja i podgląd
`node --test tests/cable-routing-top.test.mjs` — test reguł górnego i dolnego banku, położenia zacisków i dopasowania końców przewodów. Kontrolę trzeba uzupełnić testem wizualnym: https://maxstudiopl.github.io/elektryk/ → zadanie 001 → Widok zwykły i **WIĘKSZA ROZDZIELNICA** → sprawdzenie O1 / O2, kolorów L/N/PE, ich zacisków i prowadzenia kabli po automatycznym uzbrojeniu.

## v0.7.17.3 — narzędzia w trybie większej rozdzielnicy i sekcje + / −

Główne usprawnienia dla podglądu https://maxstudiopl.github.io/elektryk/:

- **WIĘKSZA ROZDZIELNICA** nie odcina dostępu do aparatów i przewodów. Przy jednoczesnym zwinięciu lewej i prawej kolumny kod *przenosi istniejącą* `.rightbar` do poziomego doku nad rozdzielnicą. Widoczne pozostają trzy niezależne części: Przewody i kable, Aparatura PRO oraz Szczegóły elementu. Katalog aparatów przewija się poziomo, a poszczególne panele mają własne przewijanie pionowe.
- **PRZYWRÓĆ PANELE** odtwarza pierwotne położenie tej samej `.rightbar` bez kopiowania elementów, gubienia event listenerów, zaznaczeń czy stanu elektrycznego. Pojedyncze przełączniki zadań/narzędzi nadal działają.
- Sześć niezależnych przycisków **+ / −**: Aktywne zadanie, Postęp gracza, Nauka 2.0 — postęp, Przewody i kable, Aparatura PRO • DIN, Szczegóły elementu. Stan otwarcia jest pamiętany w localStorage. Zamknięcie Aktywnego zadania **nie** zamyka sekcji postępu.
- **MOSTKI / GRZEBIEŃ ZASILAJĄCY**: opcje Mostek, Grzebień 1F i Grzebień 3F oraz przyciski akcji są układane jeden pod drugim, również w widoku powiększonym.
- Pliki: `workspace-panels-v07173.js`, `workspace-panels-v07173.css`, aktualizacja `ui-pro-v07122.js`. Nie zmieniano geometrii, zacisków, połączeń ani logiki elektrycznej.

### Lista kontroli po publikacji

1. W Nauka i Wolna Budowa kliknij **WIĘKSZA ROZDZIELNICA**; ponad rozdzielnicą musi pokazać się poziomy pasek narzędzi, z aktywnymi przyciskami wyboru żyły i aparatury PRO.
2. Wybierz przekrój kabla, żyłę, aparat oraz Mostek/Grzebień. Sprawdź reakcję i zachowanie zaznaczenia po kliknięciu **PRZYWRÓĆ PANELE**, a następnie ponownym powiększeniu.
3. Sprawdź sześć przełączników + / −. Potwierdź, że Postęp gracza i Nauka — postęp działają niezależnie od Aktywnego zadania.
4. Przełącz zadanie 001 → 002: przycisk + / − przy nagłówku aktywnego zadania musi pozostać.
5. Przejdź do rozdzielnicy przemysłowej (ZUG X1) i sprawdź, czy jej górny rząd oraz szyny N/PE pozostają nienaruszone.
6. Sprawdź laptop, szeroki monitor i telefon. Automatyczne testy kodu i logiki nie zastępują wizualnego testu w zalogowanej przeglądarce.

## v0.7.17.2 — dopracowanie lewego i prawego panelu

Na podstawie rzeczywistego podglądu stanowiska przygotowano oddzielny arkusz `side-panels-v07172.css`, wczytywany jako ostatni w `index.html`.

**Lewy panel:** poprawiono wielkość i kontrast tekstu w aktywnym zadaniu, listę wymagań, liczniki postępu, nagrodę XP, podsumowanie okablowania, wybór modelu i trzy sloty zapisu projektu. Liczniki postępu mają układ 2×2 na desktopie, 4 w rzędzie na średnich ekranach oraz 2×2 na telefonach. Stan aktywnego slotu, zapisu i błędów pozostał rozróżnialny.

**Prawy panel:** powiększono przyciski przekroju kabli, poprawiono zaznaczenie aktywnej żyły L1/L2/L3/N/PE bez zmiany jej fizycznego koloru, uporządkowano przyciski okablowania i mostków, filtry katalogu, dwukolumnowe karty aparatów PRO oraz szczegóły wybranego aparatu. Zarówno `selected`, jak i `install-selected` mają widoczne wyróżnienie.

**Nie zmieniono:** algorytmów elektrycznych, układu rozdzielnicy, współrzędnych zacisków, fizycznej geometrii przewodów, trybów gry i Panelu Użytkownika. Poprawki dotyczą tylko prezentacji bocznych paneli i synchronizacji numeru wersji.

### Sprawdzenie w podglądzie

Na https://maxstudiopl.github.io/elektryk/ sprawdź wybór zadania, postępy, zaznaczanie slotów zapisu, zmianę przekroju kabla, przełączanie żył, mostków i kliknięcie aparatu w katalogu. Warto porównać szerokość 1755 px z ekranem laptopa i telefonu. Kontrola źródeł oraz składni została wykonana; pełna wizualna kontrola działającej gry pozostaje do przeprowadzenia w przeglądarce.

## v0.7.17.1 — ergonomia Nauki 2.0 na podstawie zrzutów użytkownika

Po analizie rzeczywistego ekranu 1755 × 862 usunięto zbędne zajmowanie wysokości przez dwa panele instruktażowe nad rozdzielnicą.

- Wprowadzone zostały zwarte odstępy, nagłówki, wzorzec DIN, legenda i komunikaty w Nauka 2.0.
- Przycisk **ZWIŃ / POKAŻ WZORZEC** ukrywa wzorcowe rzędy i legendę, ale pozostawia wynik dopasowania oraz przyciski sprawdzania montażu i schematu.
- Po uruchomieniu **UZBRÓJ AUTOMATYCZNIE** lub **KROK PO KROKU** wzorzec zwija się, a stanowisko przewija się do rozdzielnicy. Funkcja nie działa, jeżeli rozpoczęcie asysty się nie powiodło.
- W panelu automatycznego uzbrajania dodano **PRZEJDŹ DO ROZDZIELNICY**; reset, nowe zadanie i powrót do nauki przywracają widoczność wzorca.
- Zachowana pełna obsługa kroków asysty, komunikatów statusu oraz pouczeń edukacyjnych.
- Zaktualizowano błędny numer wersji w module `tasks-v046.js` (pokazywał v0.7.15.3 mimo nowszej wersji symulatora).
- Nowe pliki: `learning-layout-v07171.css` oraz `learning-layout-v07171.js`.
- Nie zmieniono położenia zacisków, szyn DIN, przewodów, logiki sprawdzania układu ani Panelu Użytkownika.

### Kontrola

Sprawdź https://maxstudiopl.github.io/elektryk/ → Panel Użytkownika → Nauka. Rozpocznij zadanie, przełącz wzorzec, wybierz „Uzbrój automatycznie”, wróć do zadania, następnie uruchom „Krok po kroku”. W każdym przypadku rozdzielnica powinna być łatwo dostępna, a funkcje oceniania i schematów pozostać czynne. Przetestowano składnię i testową logikę przycisków, nie wykonano testu w rzeczywistej zalogowanej sesji przeglądarki.

## v0.7.17 — pierwszy etap odświeżenia całego stanowiska

Nowa, odrębna warstwa `workspace-design-v0717.css` (za dotychczasowymi stylami) ujednolica **wyłącznie interfejs symulatora poza Panelem Użytkownika**:

- Pasek główny, przyciski nawigacji, profil i wskaźnik poziomu.
- Panele boczne, nagłówki sekcji i wybór zadania.
- Czytelność opisów, warunki zadania i sloty zapisu projektów.
- Pasek narzędzi, nagłówek rozdzielnicy i liczniki stanowiska.
- Wybór przewodów, filtry katalogu, karty aparatury PRO i szczegóły elementu.
- Lepsze stany aktywne, podświetlenia klawiatury i wspólne kolory marki PRO.

**Nie zmieniono** geometrii `.cabinet-inner`, szyn DIN, listw N/PE, zacisków, położenia WLZ, tras kablowych, algorytmów montażu ani Panelu Użytkownika. Układ trzech kolumn i przełączanie widoczności paneli pozostają bez zmian.

### Wizualna weryfikacja

Na https://maxstudiopl.github.io/elektryk/ sprawdź kolejno Wolną Budowę, Naukę, Egzamin i Przemysł. Zweryfikuj czytelność paneli, zaznaczanie aparatów, aktywny slot zapisu i skalowanie w węższych oknach. To etap spójności wizualnej; przed dalszą przebudową geometrii potrzebny jest test w prawdziwej przeglądarce z uruchomionym symulatorem.

### Kolejne proponowane prace

1. Projektowanie spójnych okien zadań, wyboru obudowy, pomocy i raportów diagnostycznych.
2. Dokładne dopracowanie ikon, miniatur aparatów PRO, oznaczeń i odstępów.
3. Praktyczne testy responsywności, przewijania i widoczności połączeń na desktopie / tablecie.
4. Ograniczanie konfliktów nakładających się reguł CSS w ramach bezpiecznych, testowalnych kroków.

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
