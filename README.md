# Battleships - 

Projekt implementuje klasyczną grę w statki w TypeScript, w której dwa algorytmy rozgrywają przeciwko sobie jedną pełną partię.
Przebieg rozgrywki logoalny jest do pliku w określonym formacie.

## Wymagania
- Node.js (>= 18)
- npm lub yarn

## Instalacja
```bash
npm install
```
## Uruchomienie gry
```bash
npm start
```
Po uruchomieniu zostanie wygenerowany plik:
```bash
ships-game-YYYYMMDD-HHmmss.log
```
Plik znajduje się w katalogu głównym projektu

## Testy
Testy jednostkowe zostały przygotowane w Jest.
Uruchomienie testów:
```bash
npm test
```

## Struktura projektu (skrót)
src/
  board/
  game/
  player/
  ship/
  logger/
tests/
  board.test.ts
README.md
AI_USAGE.md
package.json
ships-game-[timestamp-1-5].log

## Opis działania
- Każdy z dwóch graczy dostaje planszę 10x10 i flotę statków (4x1, 3x2, 2x3, 1x4)
- Statki są rozmieszczane automatycznie zgodnie z zasadami gry
- Gracze wykonują naprzemienne strzały w pola, w które wcześniej nie strzelali
- Gra kończy się, gdy wszystkie statki jednego gracza zostaną zatopione
- Logi zapisywane są z perspektywy gracza pierwszego, w wymaganym formacie

## Format logów
Przykład:
HH:mm:ss.SSS place-ship: size=4 pos=(0,0) dir=horizontal
HH:mm:ss.SSS shot: pos=(4,2) result=miss
HH:mm:ss.SSS enemy-shot: pos=(3,1) result=hit
HH:mm:ss.SSS game-over: result=win total-shots=47 enemy-total-shots=52
HH:mm:ss.SSS enemy-ship: size=3 pos=(2,3) dir=vertical