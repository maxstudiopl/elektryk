(()=>{
'use strict';
// v0.7.12 katalog zastępczy: 10×1 DIN, 10×2 DIN, 10×3 DIN oraz 10 rozdzielnic specjalnych.
const TASKS=[
  {
    "id": 1,
    "title": "Pierwsza rozdzielnica",
    "description": "Wprowadzenie: FR, RCD i dwa obwody końcowe (oświetlenie B10, gniazdo B16).",
    "requirements": {
      "FR": 1,
      "RCD": 1,
      "B10": 1,
      "B16": 1
    },
    "rows": 1,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "one",
    "level": "PODSTAWY",
    "xp": 100,
    "tips": [
      "Zaplanuj aparaturę na 1 listwie DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "Oddziel zasilanie fazowe od przewodów N oraz PE.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 2,
    "title": "Dwa obwody oświetleniowe",
    "description": "Zaplanuj dwa obwody B10 i jeden obwód B16 za wydzielonym RCD.",
    "requirements": {
      "FR": 1,
      "RCD": 1,
      "B10": 2,
      "B16": 1
    },
    "rows": 1,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "one",
    "level": "PODSTAWY",
    "xp": 125,
    "tips": [
      "Zaplanuj aparaturę na 1 listwie DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "Oddziel zasilanie fazowe od przewodów N oraz PE.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 3,
    "title": "Gniazda w pokoju i kuchni",
    "description": "Rozmieść dwa B16 i jeden B10 w zwartej sekcji za RCD.",
    "requirements": {
      "FR": 1,
      "RCD": 1,
      "B10": 1,
      "B16": 2
    },
    "rows": 1,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "one",
    "level": "PODSTAWY",
    "xp": 150,
    "tips": [
      "Zaplanuj aparaturę na 1 listwie DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "Oddziel zasilanie fazowe od przewodów N oraz PE.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 4,
    "title": "Łazienka z osobnym RCBO",
    "description": "Wydziel obwód łazienki na RCBO, a pozostałe aparaty ustaw za RCD.",
    "requirements": {
      "FR": 1,
      "RCD": 1,
      "RCBO": 1,
      "B10": 2,
      "B16": 1
    },
    "rows": 1,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "one",
    "level": "PODSTAWY",
    "xp": 175,
    "tips": [
      "Zaplanuj aparaturę na 1 listwie DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "RCBO obsługuje osobny obwód; jego tor N nie jest wspólnym wyjściem innego RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 5,
    "title": "Kuchnia i oświetlenie",
    "description": "Zbuduj sekcję z trzema B16 i dwoma B10, dbając o czytelne rozmieszczenie.",
    "requirements": {
      "FR": 1,
      "RCD": 1,
      "B10": 2,
      "B16": 3
    },
    "rows": 1,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "one",
    "level": "PODSTAWY",
    "xp": 200,
    "tips": [
      "Zaplanuj aparaturę na 1 listwie DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "Oddziel zasilanie fazowe od przewodów N oraz PE.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 6,
    "title": "Rozdzielnica z ochroną SPD",
    "description": "Dodaj SPD jako odgałęzienie ochronne oraz podstawową sekcję RCD i MCB.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 1,
      "B10": 1,
      "B16": 1
    },
    "rows": 1,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "one",
    "level": "ŁATWE",
    "xp": 225,
    "tips": [
      "Zaplanuj aparaturę na 1 listwie DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 7,
    "title": "Dwa niezależne RCD",
    "description": "Oddziel dwa zestawy obwodów, każdy za własnym RCD i osobnym torem N.",
    "requirements": {
      "FR": 1,
      "RCD": 2,
      "B10": 2,
      "B16": 2
    },
    "rows": 1,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "one",
    "level": "ŁATWE",
    "xp": 250,
    "tips": [
      "Zaplanuj aparaturę na 1 listwie DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "Oddziel zasilanie fazowe od przewodów N oraz PE.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 8,
    "title": "SPD i wydzielony obwód",
    "description": "Połącz sekcję RCD z osobnym RCBO i zabezpieczeniem przepięciowym SPD.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 1,
      "RCBO": 1,
      "B10": 2,
      "B16": 2
    },
    "rows": 1,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "one",
    "level": "ŁATWE",
    "xp": 275,
    "tips": [
      "Zaplanuj aparaturę na 1 listwie DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 9,
    "title": "Trzy strefy mieszkania",
    "description": "Rozplanuj dwie sekcje RCD i jeden indywidualny obwód RCBO.",
    "requirements": {
      "FR": 1,
      "RCD": 2,
      "RCBO": 1,
      "B10": 2,
      "B16": 3
    },
    "rows": 1,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "one",
    "level": "ŁATWE",
    "xp": 300,
    "tips": [
      "Zaplanuj aparaturę na 1 listwie DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "RCBO obsługuje osobny obwód; jego tor N nie jest wspólnym wyjściem innego RCD.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 10,
    "title": "Kompaktowa rozdzielnica 16M",
    "description": "Wykorzystaj 16 z 18 modułów: FR, SPD, dwa RCD, RCBO i MCB.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 2,
      "RCBO": 1,
      "B10": 2,
      "B16": 2
    },
    "rows": 1,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "one",
    "level": "ŁATWE",
    "xp": 325,
    "tips": [
      "Zaplanuj aparaturę na 1 listwie DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 11,
    "title": "Mieszkanie dwurzędowe",
    "description": "Ułóż dwie sekcje RCD oraz rozdziel obwody oświetlenia i gniazd na dwie szyny DIN.",
    "requirements": {
      "FR": 1,
      "RCD": 2,
      "B10": 4,
      "B16": 8
    },
    "rows": 2,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "two",
    "level": "ŚREDNIE",
    "xp": 250,
    "tips": [
      "Zaplanuj aparaturę na 2 listwach DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "Oddziel zasilanie fazowe od przewodów N oraz PE.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 12,
    "title": "Dwurzędowa ochrona SPD",
    "description": "Dodaj SPD, rozdziel MCB między listwy oraz zapewnij osobne tory N dla RCD.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 2,
      "B10": 4,
      "B16": 7
    },
    "rows": 2,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "two",
    "level": "ŚREDNIE",
    "xp": 275,
    "tips": [
      "Zaplanuj aparaturę na 2 listwach DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 13,
    "title": "Dom z osobnym RCBO",
    "description": "Rozdziel odbiorniki na trzy sekcje RCD i obwód z własnym RCBO.",
    "requirements": {
      "FR": 1,
      "RCD": 3,
      "RCBO": 1,
      "B10": 4,
      "B16": 7
    },
    "rows": 2,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "two",
    "level": "ŚREDNIE",
    "xp": 300,
    "tips": [
      "Zaplanuj aparaturę na 2 listwach DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "RCBO obsługuje osobny obwód; jego tor N nie jest wspólnym wyjściem innego RCD.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 14,
    "title": "Dom piętrowy z SPD",
    "description": "Wydziel trzy sekcje ochrony różnicowoprądowej i uporządkuj dwa rzędy.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 3,
      "B10": 5,
      "B16": 7
    },
    "rows": 2,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "two",
    "level": "ŚREDNIE",
    "xp": 325,
    "tips": [
      "Zaplanuj aparaturę na 2 listwach DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 15,
    "title": "Pralka, zmywarka i piekarnik",
    "description": "Zastosuj trzy RCBO dla niezależnych odbiorników oraz dwie sekcje RCD.",
    "requirements": {
      "FR": 1,
      "RCD": 2,
      "RCBO": 3,
      "B10": 5,
      "B16": 8
    },
    "rows": 2,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "two",
    "level": "ŚREDNIE",
    "xp": 350,
    "tips": [
      "Zaplanuj aparaturę na 2 listwach DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "RCBO obsługuje osobny obwód; jego tor N nie jest wspólnym wyjściem innego RCD.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 16,
    "title": "Garaż i część mieszkalna",
    "description": "Oddziel obwody garażu od części domowej i rozplanuj SPD oraz RCBO.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 3,
      "RCBO": 2,
      "B10": 5,
      "B16": 8
    },
    "rows": 2,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "two",
    "level": "TRUDNE",
    "xp": 375,
    "tips": [
      "Zaplanuj aparaturę na 2 listwach DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 17,
    "title": "Lokal usługowy",
    "description": "Zbuduj cztery sekcje RCD, dwa obwody RCBO i dwa rzędy gniazd oraz oświetlenia.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 4,
      "RCBO": 2,
      "B10": 6,
      "B16": 8
    },
    "rows": 2,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "two",
    "level": "TRUDNE",
    "xp": 400,
    "tips": [
      "Zaplanuj aparaturę na 2 listwach DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 18,
    "title": "Biuro z wydzielonymi strefami",
    "description": "Rozplanuj cztery RCD i trzy RCBO, dbając o przejrzystość stref.",
    "requirements": {
      "FR": 1,
      "RCD": 4,
      "RCBO": 3,
      "B10": 6,
      "B16": 9
    },
    "rows": 2,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "two",
    "level": "TRUDNE",
    "xp": 425,
    "tips": [
      "Zaplanuj aparaturę na 2 listwach DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "RCBO obsługuje osobny obwód; jego tor N nie jest wspólnym wyjściem innego RCD.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 19,
    "title": "Dwurzędowa rozdzielnica 34M",
    "description": "Zapełnij 34 moduły, zachowując grupy RCD, RCBO i rozdział przewodów N.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 4,
      "RCBO": 2,
      "B10": 7,
      "B16": 9
    },
    "rows": 2,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "two",
    "level": "TRUDNE",
    "xp": 450,
    "tips": [
      "Zaplanuj aparaturę na 2 listwach DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 20,
    "title": "Mistrz dwóch szyn DIN",
    "description": "Rozmieść wszystkie 36 modułów bez wolnych pozycji i zakończ symulowanymi połączeniami.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 4,
      "RCBO": 3,
      "B10": 7,
      "B16": 9
    },
    "rows": 2,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "two",
    "level": "TRUDNE",
    "xp": 475,
    "tips": [
      "Zaplanuj aparaturę na 2 listwach DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 21,
    "title": "Rozdzielnica trzypiętrowa",
    "description": "Przenieś cztery sekcje RCD oraz dwa RCBO na trzy szyny DIN.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 4,
      "RCBO": 2,
      "B10": 8,
      "B16": 12
    },
    "rows": 3,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "three",
    "level": "TRUDNE",
    "xp": 400,
    "tips": [
      "Zaplanuj aparaturę na 3 listwach DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 22,
    "title": "Dom, piętro i garaż",
    "description": "Wyodrębnij strefy funkcjonalne, zachowując ciągłość własnych torów N.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 4,
      "RCBO": 3,
      "B10": 9,
      "B16": 12
    },
    "rows": 3,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "three",
    "level": "TRUDNE",
    "xp": 425,
    "tips": [
      "Zaplanuj aparaturę na 3 listwach DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 23,
    "title": "Instalacja z pięcioma RCD",
    "description": "Zorganizuj pięć sekcji odbiorczych i dwa niezależne zabezpieczenia RCBO.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 5,
      "RCBO": 2,
      "B10": 9,
      "B16": 12
    },
    "rows": 3,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "three",
    "level": "TRUDNE",
    "xp": 450,
    "tips": [
      "Zaplanuj aparaturę na 3 listwach DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 24,
    "title": "Warsztat z wydzielonymi obwodami",
    "description": "Ułóż trzy rzędy zabezpieczeń, w tym pięć RCD i trzy RCBO.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 5,
      "RCBO": 3,
      "B10": 10,
      "B16": 12
    },
    "rows": 3,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "three",
    "level": "TRUDNE",
    "xp": 475,
    "tips": [
      "Zaplanuj aparaturę na 3 listwach DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 25,
    "title": "Rozdzielnica domu z ogrodem",
    "description": "Dodaj wydzielone obwody i cztery RCBO, nie mieszając torów N.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 5,
      "RCBO": 4,
      "B10": 10,
      "B16": 13
    },
    "rows": 3,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "three",
    "level": "TRUDNE",
    "xp": 500,
    "tips": [
      "Zaplanuj aparaturę na 3 listwach DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 26,
    "title": "Trzy listwy – podział stref",
    "description": "Zaprojektuj montaż sześciu sekcji RCD i trzech RCBO w 48 modułach.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 6,
      "RCBO": 3,
      "B10": 10,
      "B16": 14
    },
    "rows": 3,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "three",
    "level": "EKSPERT",
    "xp": 525,
    "tips": [
      "Zaplanuj aparaturę na 3 listwach DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 27,
    "title": "Trzy listwy – duży dom",
    "description": "Osiągnij 51 modułów i rozdziel aparaty zgodnie z podziałem obwodów.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 6,
      "RCBO": 4,
      "B10": 10,
      "B16": 15
    },
    "rows": 3,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "three",
    "level": "EKSPERT",
    "xp": 550,
    "tips": [
      "Zaplanuj aparaturę na 3 listwach DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 28,
    "title": "Trzy listwy – rezerwa 2M",
    "description": "Zajmij 52 moduły i zostaw miejsce na dwa wolne moduły.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 6,
      "RCBO": 5,
      "B10": 10,
      "B16": 14
    },
    "rows": 3,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "three",
    "level": "EKSPERT",
    "xp": 575,
    "tips": [
      "Zaplanuj aparaturę na 3 listwach DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 29,
    "title": "Trzy listwy – rezerwa 1M",
    "description": "Rozplanuj 53 moduły, dbając o kolejność montażu szerokich aparatów.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 6,
      "RCBO": 5,
      "B10": 10,
      "B16": 15
    },
    "rows": 3,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "three",
    "level": "EKSPERT",
    "xp": 600,
    "tips": [
      "Zaplanuj aparaturę na 3 listwach DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 30,
    "title": "Egzamin treningowy 54M",
    "description": "Uzupełnij pełne 54 moduły trzema rzędami DIN i wszystkimi wydzielonymi sekcjami.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 6,
      "RCBO": 6,
      "B10": 10,
      "B16": 14
    },
    "rows": 3,
    "modulesPerRow": 18,
    "boardId": "TRAINING-TASK",
    "group": "three",
    "level": "EKSPERT",
    "xp": 625,
    "tips": [
      "Zaplanuj aparaturę na 3 listwach DIN po 18 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 31,
    "title": "Podtynkowa domowa 3×12",
    "description": "Dopasuj trzy listwy po 12 modułów do rozdzielnicy podtynkowej i wyposaż je w SPD.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 3,
      "RCBO": 1,
      "B10": 5,
      "B16": 8
    },
    "rows": 3,
    "modulesPerRow": 12,
    "boardId": "REF-3X12-FLUSH-SURFACE",
    "group": "xl",
    "level": "ŚREDNIE",
    "xp": 550,
    "tips": [
      "Zaplanuj aparaturę na 3 listwach DIN po 12 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 32,
    "title": "Natynkowa domowa 3×12",
    "description": "Wykonaj układ w rozdzielnicy natynkowej o węższych rzędach 12M.",
    "requirements": {
      "FR": 1,
      "RCD": 3,
      "RCBO": 2,
      "B10": 6,
      "B16": 10
    },
    "rows": 3,
    "modulesPerRow": 12,
    "boardId": "REF-3X12-SURFACE",
    "group": "xl",
    "level": "ŚREDNIE",
    "xp": 575,
    "tips": [
      "Zaplanuj aparaturę na 3 listwach DIN po 12 modułów, rozpoczynając od rozłącznika FR.",
      "RCBO obsługuje osobny obwód; jego tor N nie jest wspólnym wyjściem innego RCD.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 33,
    "title": "Duży dom 5×12",
    "description": "Zbuduj rozdzielnicę pięciorzędową dla wielu stref i samodzielnych obwodów.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 6,
      "RCBO": 3,
      "B10": 9,
      "B16": 10
    },
    "rows": 5,
    "modulesPerRow": 12,
    "boardId": "REF-5X12",
    "group": "xl",
    "level": "EKSPERT",
    "xp": 600,
    "tips": [
      "Zaplanuj aparaturę na 5 listwach DIN po 12 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 34,
    "title": "Budynek piętrowy 5×12",
    "description": "Podziel większą instalację na siedem sekcji RCD i cztery obwody RCBO.",
    "requirements": {
      "FR": 1,
      "RCD": 7,
      "RCBO": 4,
      "B10": 12,
      "B16": 12
    },
    "rows": 5,
    "modulesPerRow": 12,
    "boardId": "REF-5X12",
    "group": "xl",
    "level": "EKSPERT",
    "xp": 625,
    "tips": [
      "Zaplanuj aparaturę na 5 listwach DIN po 12 modułów, rozpoczynając od rozłącznika FR.",
      "RCBO obsługuje osobny obwód; jego tor N nie jest wspólnym wyjściem innego RCD.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 35,
    "title": "Dom i warsztat 5×12",
    "description": "Ułóż SPD, siedem RCD, sześć RCBO i kilkanaście MCB w pięciu rzędach.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 7,
      "RCBO": 6,
      "B10": 12,
      "B16": 12
    },
    "rows": 5,
    "modulesPerRow": 12,
    "boardId": "REF-5X12",
    "group": "xl",
    "level": "EKSPERT",
    "xp": 650,
    "tips": [
      "Zaplanuj aparaturę na 5 listwach DIN po 12 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 36,
    "title": "Rozbudowany dom 5×12",
    "description": "Zaplanuj osiem sekcji RCD, sześć RCBO oraz ochronę SPD w obudowie 60M.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 8,
      "RCBO": 6,
      "B10": 12,
      "B16": 10
    },
    "rows": 5,
    "modulesPerRow": 12,
    "boardId": "REF-5X12",
    "group": "xl",
    "level": "EKSPERT",
    "xp": 675,
    "tips": [
      "Zaplanuj aparaturę na 5 listwach DIN po 12 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 37,
    "title": "Rozdzielnica XL 5×24 – baza",
    "description": "Odtwórz 72 moduły w obudowie XL: liczne obwody i wydzielone grupy różnicowoprądowe.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 8,
      "RCBO": 8,
      "B10": 14,
      "B16": 20
    },
    "rows": 5,
    "modulesPerRow": 24,
    "boardId": "REF-5X24",
    "group": "xl",
    "level": "MASTER",
    "xp": 700,
    "tips": [
      "Zaplanuj aparaturę na 5 listwach DIN po 24 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 38,
    "title": "Obiekt usługowy XL 5×24",
    "description": "Zbuduj układ 84M dla dużej liczby sekcji i aparatury zabezpieczającej.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 10,
      "RCBO": 10,
      "B10": 16,
      "B16": 22
    },
    "rows": 5,
    "modulesPerRow": 24,
    "boardId": "REF-5X24",
    "group": "xl",
    "level": "MASTER",
    "xp": 725,
    "tips": [
      "Zaplanuj aparaturę na 5 listwach DIN po 24 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 39,
    "title": "Rozdzielnica XL 100M",
    "description": "Wykorzystaj sto modułów w pięciu szynach DIN po 24 moduły.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 12,
      "RCBO": 12,
      "B10": 20,
      "B16": 26
    },
    "rows": 5,
    "modulesPerRow": 24,
    "boardId": "REF-5X24",
    "group": "xl",
    "level": "MASTER",
    "xp": 750,
    "tips": [
      "Zaplanuj aparaturę na 5 listwach DIN po 24 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  },
  {
    "id": 40,
    "title": "Rozdzielnica XL MASTER 118M",
    "description": "Końcowy projekt rozbudowanej obudowy 120M z tylko dwoma wolnymi modułami.",
    "requirements": {
      "FR": 1,
      "SPD": 1,
      "RCD": 12,
      "RCBO": 16,
      "B10": 24,
      "B16": 32
    },
    "rows": 5,
    "modulesPerRow": 24,
    "boardId": "REF-5X24",
    "group": "xl",
    "level": "MASTER",
    "xp": 775,
    "tips": [
      "Zaplanuj aparaturę na 5 listwach DIN po 24 modułów, rozpoczynając od rozłącznika FR.",
      "SPD połącz jako odgałęzienie ochronne, zgodnie z dokumentacją producenta; nie używaj go jako zabezpieczenia szeregowego.",
      "Każda sekcja RCD ma niezależny tor N; nie łącz neutralnych po stronie odbiorczej różnych RCD.",
      "Wyjście RCBO zasila tylko dedykowany obwód.",
      "Po rozmieszczeniu aparatów porównaj moduły ze schematem, po czym sprawdź cztery obwody testowe w analizatorze."
    ]
  }
 ];
TASKS.push(...(window.ElektrykCurriculum?.extraTasks?.()||[]));
const MODULES={FR:4,RCD:2,B10:1,B16:1,RCBO:2,SPD:2};
const modal=document.getElementById('taskModal');
const cards=document.querySelector('.task-cards');
if(!cards||!window.ElektrykStage2)return;
const headerSmall=modal?.querySelector('.task-window-head small');
if(headerSmall)headerSmall.textContent=TASKS.length+' zadań • 1–5 szyn DIN • 12/18/24 moduły na szynie';
const shortcut=document.querySelector('.task-button small');
if(shortcut)shortcut.textContent=TASKS.length+' zadań • montaż, diagnostyka i schematy';
function usedModules(task){return Object.entries(task.requirements).reduce((sum,[code,n])=>sum+(MODULES[code]||0)*n,0)}
function reqSummary(task){return Object.entries(task.requirements).map(([code,n])=>code+'×'+n).join(' • ')}
const tool=document.createElement('div');tool.className='task-catalog-tabs';tool.setAttribute('aria-label','Grupy zadań');
const filters=[
 {key:'all',label:'WSZYSTKIE'},
 {key:'one',label:'1 SZYNA DIN'},
 {key:'two',label:'2 SZYNY DIN'},
 {key:'three',label:'3 SZYNY DIN'},
 {key:'xl',label:'DUŻE ROZDZIELNICE'}
].map(f=>({...f,count:f.key==='all'?TASKS.length:TASKS.filter(t=>t.group===f.key).length}));
let activeFilter='one',page=0,query='';
filters.forEach(f=>{
  const btn=document.createElement('button');btn.type='button';btn.dataset.group=f.key;
  btn.textContent=f.label+' ('+f.count+')';
  btn.addEventListener('click',()=>{activeFilter=f.key;page=0;render()});
  tool.appendChild(btn)
});
cards.insertAdjacentElement('beforebegin',tool);
const catalogSearch=document.createElement('div');catalogSearch.className='task-search';
const input=document.createElement('input');input.type='search';
input.placeholder='Szukaj zadania, aparatu, poziomu lub numeru…';
input.setAttribute('aria-label','Szukaj spośród 300 zadań');
input.addEventListener('input',()=>{query=input.value.trim().toLocaleLowerCase('pl-PL');page=0;render()});
catalogSearch.appendChild(input);
const counter=document.createElement('span');counter.className='task-search-counter';
catalogSearch.appendChild(counter);cards.insertAdjacentElement('beforebegin',catalogSearch);
const pagination=document.createElement('div');pagination.className='task-pagination';
const prev=document.createElement('button');prev.type='button';prev.textContent='← POPRZEDNIE';
const summary=document.createElement('span');summary.setAttribute('aria-live','polite');
const next=document.createElement('button');next.type='button';next.textContent='NASTĘPNE →';
prev.addEventListener('click',()=>{page=Math.max(0,page-1);render()});
next.addEventListener('click',()=>{page++;render()});
pagination.append(prev,summary,next);cards.insertAdjacentElement('afterend',pagination);
function render(){
  cards.replaceChildren();
  tool.querySelectorAll('button').forEach(b=>{const on=b.dataset.group===activeFilter;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
  const eligible=TASKS.filter(t=>(query||activeFilter==='all'||t.group===activeFilter)&&
    (!query||[t.id,t.title,t.description,t.level,t.section||'',
      Object.keys(t.requirements||{}).join(' ')].join(' ').toLocaleLowerCase('pl-PL').includes(query)));
  const size=12,totalPages=Math.max(1,Math.ceil(eligible.length/size));
  page=Math.min(page,totalPages-1);
  counter.textContent=eligible.length+' z '+TASKS.length+' zadań';
  summary.textContent='Strona '+(page+1)+' / '+totalPages;
  prev.disabled=page===0;next.disabled=page>=totalPages-1;
  eligible.slice(page*size,(page+1)*size).forEach(task=>{
    const btn=document.createElement('button');btn.type='button';btn.className='task-card rows-'+task.rows;btn.dataset.taskId=String(task.id);
    btn.innerHTML='<div class="task-card-top"><b>'+String(task.id).padStart(2,'0')+'</b><span>'+task.level+'</span></div>'+
      '<strong>'+task.title+'</strong>'+
      '<div class="task-card-meta"><span>'+task.rows+'×'+task.modulesPerRow+'M</span><span>'+usedModules(task)+'/'+(task.rows*task.modulesPerRow)+'M</span><span>'+task.xp+' XP</span></div>'+
      '<small>'+reqSummary(task)+'</small><em>ROZPOCZNIJ ZADANIE ›</em>';
    btn.addEventListener('click',()=>startTask(task,btn));cards.appendChild(btn);
  });
  window.ElektrykProgress?.refreshProfile?.();
  window.ElektrykProgress?.refreshCards?.();
}
function applyCircuitLayout(task){
 const host=document.querySelector('.circuits');if(!host)return;
 const layout=task.rows===1?'bottom':'mixed';
 host.classList.remove('layout-bottom','layout-mixed');host.classList.add('layout-'+layout);
 [...host.children].forEach((c,i)=>{c.dataset.exit=layout==='mixed'&&i>=2?'top-right':'bottom'});
 requestAnimationFrame(()=>{window.ElektrykStage3?.redraw?.();window.ElektrykStage3?.refreshGuidance?.()});
}
function startTask(task,btn){
 window.ElektrykStage2.configureTask(task);
 applyCircuitLayout(task);
 document.dispatchEvent(new CustomEvent('elektryk:task-started',{detail:{task}}));
 tool.querySelectorAll('button').forEach(b=>b.classList.toggle('selected-task',b.dataset.group===task.group));
 if(modal)modal.hidden=true;
 const title=document.querySelector('.active-task .panel-title');if(title)title.textContent='AKTYWNE ZADANIE • '+String(task.id).padStart(3,'0')+'/'+TASKS.length;
 const ver=document.querySelector('.cabinet-head .version');if(ver)ver.textContent='v0.7.17.5 • ROZDZIELNICAPRO.PL • ZADANIE '+String(task.id).padStart(2,'0')+' • '+task.rows+'×'+task.modulesPerRow+'M';
}
render();
startTask(TASKS[0],cards.querySelector('[data-task-id="1"]'));
window.ElektrykTasks={all:TASKS,
  start:function(id){const t=TASKS.find(x=>x.id===Number(id));if(!t)return false;
    activeFilter=t.group;page=0;query='';input.value='';render();
    startTask(t,cards.querySelector('[data-task-id="'+t.id+'"]'));return true
  },
  current:function(){return window.ElektrykStage2.getTask()},
  groups:filters,filter:(group)=>{if(filters.some(f=>f.key===group)){activeFilter=group;page=0;render()}}
};
})();