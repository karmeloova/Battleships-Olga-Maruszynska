# Battleships (Gra w statki)

Projekt implementuje klasyczną grę w statki w TypeScript, w której dwa algorytmy rozgrywają przeciwko sobie jedną pełną partię.
Cały przebieg rozgrywki (rozmieszczenie statków, strzały, zatopienia, wynik) zapisywany jest do pliku w określonym formacie.

## 🚀 Wymagania
- Node.js (>= 18)
- npm lub yarn

## 🔧 Instalacja
```bash
npm install
```
## ▶️ Uruchomienie gry
```bash
npm start
```
Po uruchomieniu zostanie wygenerowany plik logów w katalogu głównym:
```bash
ships-game-YYYYMMDD-HHmmss.log
```

## 🧪 Testy
Testy jednostkowe zostały przygotowane w Jest.
Uruchomienie testów:
```bash
npm test
```
Przykład sprawdza m.in.:
- poprawne i niepoprawne rozmieszczenie statków
- kolizje i nakładanie
- duplikaty strzałów
- logikę hit/miss/sunk

## 📁 Struktura projektu 
```bash
battleships/
├── src/
│   ├── board/
│   ├── game/
│   ├── player/
│   ├── ship/
│   └── logger/
├── tests/
│   └── board.test.ts
├── ships-game-[timestamp].log
├── README.md
├── AI_USAGE.md
└── package.json
```

## 📝 Opis działania
- Każdy z dwóch graczy dostaje planszę 10x10 oraz standardową flotę statków (4x1, 3x2, 2x3, 1x4)
- Statki są rozmieszczane automatycznie zgodnie z zasadami gry
- Gracze wykonują naprzemienne strzały w pola, w które wcześniej nie strzelali (losowo)
- Wynik strzału może być
    - miss
    - hit
    - sunk (z informacją o rozmiarze statku)
- Gra kończy się, gdy wszystkie statki jednego gracza zostaną zatopione
- Logi zapisywane są z perspektywy gracza pierwszego, w wymaganym formacie

## 📄 Format logów
Przykład:
HH:mm:ss.SSS place-ship: size=4 pos=(0,0) dir=horizontal
HH:mm:ss.SSS shot: pos=(4,2) result=miss
HH:mm:ss.SSS enemy-shot: pos=(3,1) result=hit
HH:mm:ss.SSS game-over: result=win total-shots=47 enemy-total-shots=52
HH:mm:ss.SSS enemy-ship: size=3 pos=(2,3) dir=vertical

## 📦 Uwagi dodatkowe
- Logika gry została zaprojektowana w sposób modularny (Board, Game, Player, Ship)
- Logger umożliwia generowanie logów dokładnie w wymaganym formacie
- Testy obejmują kluczową funkcjonalność planszy i wewnętrzną logikę gry