## 1. Użyte narzędzia AI

W trakcie zadania używałam kilku agentów AI:

- **Cursor (wbudowany model)** – główne narzędzie do:
  - generowania kodu (szczególnie scaffoldu i implementacji plików `.ts`)
  - refaktoryzacji fragmentów kodu
- **ChatGPT (GPT-5.1 Thinking)** – pomoc przy:
  - doprecyzowaniu i rozbudowaniu promptów tak, żeby były zrozumiałe dla innego AI
  - analizie błędów wygenerowanego kodu
- **Claude 4.5 Haiku** – użyty do:
  - generowania zestawu testów jednostkowych (Jest) dla klasy `Board`

## 2. Przykłady promptów

### Prompt 1 - Generowanie scaffoldu Battleships

**Prompt**
```text
Generate the whole Battleships project scaffold in TypeScript for a Node.js console application.

Goal:
I want a complete, realistic scaffold (types + interfaces + classes with fields and method signatures),
but NO game logic implemented yet. Method bodies should only contain TODO comments.

Context (from the task):
- Two AI players play Battleships against each other.
- Board size: 10x10, coordinates (0,0)–(9,9).
- Fleet:
  • 1 ship of size 4
  • 2 ships of size 3
  • 3 ships of size 2
  • 4 ships of size 1
- Shot results: miss | hit | sunk.
- Players shoot in turns, can’t shoot the same cell twice.
- On each run, the program plays a single game and saves a log file:
  ships-game-<timestamp>.log with timestamp yyyyMMdd-HHmmss.
- Log events (from Player 1 perspective):
  place-ship, shot, enemy-shot, game-over, enemy-ship.

Project structure to generate:

src/
  types/
    common.ts
    ship.ts
    board.ts
    player.ts
    game.ts

  ship/
    Ship.ts

  board/
    Board.ts

  player/
    Player.ts

  logger/
    Logger.ts

  game/
    Game.ts

  index.ts

Requirements for types and interfaces:

- common.ts:
  • Coordinate { x: number; y: number }
  • Orientation: 'horizontal' | 'vertical'
  • CellState: 'empty' | 'ship' | 'hit' | 'miss'
  • ShotResult with: coordinate, outcome ('hit' | 'miss' | 'sunk'), optional ship size/id

- ship.ts:
  • ShipDefinition (id, size)
  • ShipPlacement (definition, bow coordinate, orientation)
  • ShipInstance (definition, list of coordinates, list of hits, isSunk(): boolean)

- board.ts:
  • BoardConfig (width, height)
  • BoardState (2D cells array, ship instances, shots fired)
  • Board interface with:
      - config, state
      - placeShip(placement: ShipPlacement): boolean
      - receiveShot(coord: Coordinate): ShotResult
      - allShipsSunk(): boolean

- player.ts:
  • PlayerId = string
  • Player interface with:
      - id, name, board
      - takeTurn(opponent: Player): Promise<Coordinate>
      - handleShot(coordinate: Coordinate): ShotResult

- game.ts:
  • GameConfig (BoardConfig + fleet: ShipDefinition[])
  • TurnState (activePlayerId, turnNumber)
  • GameState (players map, turn, winnerId?, history: ShotResult[])
  • Game interface with:
      - config, state
      - setupPlayers(players: Player[]): void
      - placeShips(playerId: PlayerId, placements: ShipPlacement[]): boolean
      - start(): Promise<void>
      - takeTurn(): Promise<void>
      - isFinished(): boolean

Requirements for classes:

- Ship.ts:
  • class Ship implements ShipInstance
  • fields for definition, coordinates, hits
  • constructor(placement: ShipPlacement)
  • isSunk(): boolean with TODO in body

- Board.ts:
  • class Board implements Board
  • fields: config, state
  • constructor(config: BoardConfig) initializes empty state
  • placeShip, receiveShot, allShipsSunk with TODO bodies

- Player.ts:
  • class Player implements Player
  • fields: id, name, board
  • constructor(id: string, name: string, board: Board)
  • takeTurn(): Promise<Coordinate> with TODO (random AI later)
  • handleShot(): delegate to board with TODO body

- Logger.ts:
  • LogLevel type ('info' | 'warn' | 'error' | 'debug')
  • Logger interface with:
      - log(level, message, context?)
      - helper methods for specific events:
          logPlaceShip, logShot, logEnemyShot, logGameOver, logEnemyShip
  • class FileLogger implements Logger with fields:
      - filePath, write stream, time formatting helpers
    All methods with TODO bodies (no real file I/O yet).

- Game.ts:
  • class Game implements Game interface
  • fields: config, state
  • constructor(config: GameConfig)
  • setupPlayers, placeShips, start, takeTurn, isFinished with TODO bodies

- index.ts:
  • main() function that:
      - creates GameConfig with 10x10 board and correct fleet definition
      - constructs Game and a Logger instance
      - TODO: run a single game and write logs
    Export or immediately invoke main().

General rules:
- Use clean, readable TypeScript.
- Use proper imports between modules.
- No actual game logic, just structure, fields and method signatures.
- Method bodies should only contain TODO comments or minimal placeholder returns.
- This scaffold must be easy to implement and test later.

Generate all files with this structure and content now.
```

**Czy AI dało dobry kod za pierwszym razem?**
- Tak - struktura projektu, typy i interefejsy były poprawne i zgodne z wymaganiami. Szkielet klas również był w porządku.

**Co trzeba było coś poprawić/doprecyzować**
- Przy dalszej implementacji musiałam zmienić dane przekazywane do funkcji służącej do logowania stawiania statków, ponieważ AI początkowo dało tablicę, a rozsądniej i wygodniej było przekazywać po jednym statku.

### Prompt 2 - Implementacja Player

**Prompt**
```text
Implement the full logic for src/player/Player.ts.

Rules:
- Do NOT change imports.
- Do NOT change any interfaces from /types.
- Do NOT modify other files.
- Keep implementation mid-level and readable.
- Keep it deterministic and simple (no advanced heuristics).

Your goals:
1. Implement takeTurn():
   - Generate a list of all coordinates on the opponent board.
   - Filter out coordinates already shot by this player.
   - Choose ONE random coordinate from the remaining ones.
   - Return it as the selected shot.
   - Do NOT mutate the opponent here — only return a coordinate.

2. Implement handleShot():
   - Delegate to underlying board.receiveShot().
   - Return ShotResult from the board.

3. Keep the class minimal:
   - No logging.
   - No additional AI strategy.
   - Just clean random unshot selection logic.

4. Do NOT add new dependencies.
5. Do NOT create extra files.
6. Coordinate generation should be clean and easy to read.

Return the full content of Player.ts.
```

**Czy AI dało dobry kod za pierwszym razem**
- Logika była sensowna, jednak miała poważny błąd merytoryczny.

**Co trzeba było coś poprawić/doprecyzować**
- Było trzeba poprawić logikę oddawania strzałów. Zostało to naprawione przeze mnie (informacje w punkcie 3.).

### Prompt 3 - Implementacja index.ts (główna pętla gry + logger)

**Prompt**
```text
Implement the full logic for `src/index.ts`.

Follow these rules STRICTLY:

1. DO NOT modify any other file.
2. DO NOT add extra helpers, utils, or classes.
3. Use ONLY the existing public APIs from:
   - Game
   - FileLogger
   - BoardConfig, ShipDefinition
4. The script must:
   - Create the fleet
   - Build board config
   - Create both players with boards
   - Place ships for both AI players (random placement)
   - Run a full automated game
   - Use FileLogger for output
5. The logger must write to:
   `ships-game-<timestamp>.log`
   where timestamp = `yyyyMMdd-HHmmss`
6. Implement a **clean, mid-level, deterministic** version of random placement:
   - Try up to 50 random positions per ship
   - Orientation = horizontal or vertical
   - Use Board.placeShip() to validate
7. Game runs until winner is determined.

The output file MUST follow the exact event log format required in the spec.

DO NOT add console.log.
DO NOT add comments about your decisions.
JUST produce the correct TypeScript code for this file.
```

**Czy AI za pierwszym razem dało dobry kod?**
- Struktura była dobra, jednak pojawiły się drobne błędy, które uniemożliwiały uruchomienie programu.

**Co trzeba było coś poprawić/doprecyzować?**
- Trzeba było poprawić błędy, aby program w ogóle się odpalił. AI próbowało odwołać się do board.width i board.height zamiast board.config.height/width. Ponadto, podczas tworzenia planszy, bezpośrednio próbował ustawić height oraz width w konstruktorze planszy, zamiast zrobić poprzez stworzenie nowego BoardConfig.
Poprawki były proste, zatem zostały wykonane własnoręcznie.

### Prompt 4 - Generowanie testów jednostkowych

**Prompt**
```text
Write Jest unit tests for the Board class.
Include:
- valid ship placement
- invalid ship placement
- preventing overlapping ships
- preventing duplicate shots
- hit / miss / sunk
```

**Czy AI za pierwszym razem dało dobry kod?**
- Tak. Kod od razu był dobry, testy uruchomiły się bez najmniejszego problemu

**Co trzeba było coś poprawić/doprecyzować?**
- Nic nie trzeba było poprawiać ani doprecyzowywać

## 3. Poprawki

### 1. Błędne założenie w Player.takeTurn

**Problem**
- AI założyło, że 
```bash
// Coordinates already shot by THIS player
const fired = this.board.state.shotsFired;
```
czyli sprawdzało, jakie opponent oddał strzały w planszę gracza pierwszego - "ile razy ktoś strzelał do mnie", a nie gdzie gracz chciał strzelić.

**Naprawa**
- Poprawiłam, skąd brać informacje o już wykonanych strzałach - zamiast this.board należało sprawdzać opponent.board

### 2. Brak logowania rozmieszczenia statków gracza

**Problem**
- Przy pierwszym uruchomieniu programu zauważyłam brak logowania rozmieszczenia statków przez gracza 1. 
```bash
1  19:07:33.983  shot: pos=(5,7) result=miss
2  19:07:33.983  enemy-shot: pos=(1,4) result=miss
3  19:07:33.983  shot: pos=(0,2) result=miss
4  19:07:33.983  enemy-shot: pos=(0,6) result=miss
5  19:07:33.983  shot: pos=(3,0) result=miss
6  19:07:33.983  enemy-shot: pos=(4,0) result=miss
7  19:07:33.983  shot: pos=(5,5) result=miss
8  19:07:33.983  enemy-shot: pos=(3,7) result=miss
9  19:07:33.983  shot: pos=(5,0) result=miss
10 19:07:33.984  enemy-shot: pos=(3,1) result=miss
```
Okazało się, że AI mimo stworzenia funkcji do rozmieszczania statków w Game.ts (która również logowała to rozmieszczenie) stawiała statki bezpośrednio poprzez board.placeShip, mimo, że funkcja w Game.ts również to robi.

**Naprawa**
- Przerobiłam kod tak, aby rozmieszczanie statków szło poprzez Game.ts. Musiałam lekko zmodyfikować strukturę funkcji w Game.ts (zamiast przyjmowania tablicy ze statkami, funkcja przyjmuje pojedyczny statek), a następnie również zmodyfikować, tak aby zapisywała tylko i wyłącznie statki gracza pierwszego (żeby nie były widoczne statki drugiego gracza). Potem odpowiednio zmodyfikowałam logikę w głównym pliku gry (index.ts) i zamiast stawiać statki poprzez board.placeShip jest to realizowane przez game.placeShip.

## 4. Co działało dobrze, a co nie:
### Gdzie AI przyspieszyło pracę?
- Scaffold / struktura projektu - szybkie wygenerowanie plików, typów i interfejsów oraz sensowny podział na moduły
- Kod "boilderplate" - konstrukcje klas, podstawowe pola, konstruktory, sygnatury metod
- Testy jednostkowe (Claude) - szybkie wygenerowanie szkieletu testów dla Board i gotowe przypadki hit/miss/sunk i kolizje statków

### Do czego nadawało się gorzej?
- Logika domenowa gry - mylenie perspektywy gracza (strzały w Player.takeTurn) i kombinowanie z kilkoma źródłami prawdy (Board)
- Drobne szczegóły typów - odwoływanie się do właściwości, których nie ma w interfejsach

