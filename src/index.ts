import { Game } from './game/Game';
import { FileLogger } from './logger/Logger';
import type { GameConfig } from './types/game';
import type { ShipDefinition, ShipPlacement } from './types/ship';
import { Player } from './player/Player';
import { Board } from './board/Board';

// Use node:date for formatting, or fallback if not available.
function formatTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = now.getFullYear();
  const MM = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const HH = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `${yyyy}${MM}${dd}-${HH}${mm}${ss}`;
}

function createFleet(): ShipDefinition[] {
  return [
    { id: 'battleship-4', size: 4 },
    { id: 'cruiser-a', size: 3 },
    { id: 'cruiser-b', size: 3 },
    { id: 'destroyer-a', size: 2 },
    { id: 'destroyer-b', size: 2 },
    { id: 'destroyer-c', size: 2 },
    { id: 'submarine-a', size: 1 },
    { id: 'submarine-b', size: 1 },
    { id: 'submarine-c', size: 1 },
    { id: 'submarine-d', size: 1 },
  ];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// orientation is "horizontal" or "vertical"
function getRandomOrientation(): 'horizontal' | 'vertical' {
  return Math.random() < 0.5 ? 'horizontal' : 'vertical';
}

// Assumes Board has width and height properties
function autoPlaceShips(player: Player, fleet: ShipDefinition[], game: Game): void {
  const board = player.board;
  for (const shipDef of fleet) {
    let placed = false;
    while (!placed) {
      const orientation = getRandomOrientation();
      let maxX = board.config.width - (orientation === 'horizontal' ? shipDef.size : 1);
      let maxY = board.config.height - (orientation === 'vertical' ? shipDef.size : 1);
      if (maxX < 0) maxX = 0;
      if (maxY < 0) maxY = 0;
      const x = getRandomInt(0, maxX);
      const y = getRandomInt(0, maxY);
      const placement = {
        definition: shipDef,
        bow: { x, y },
        orientation,
      };
      placed = game.placeShip(player.id, placement);
    }
  }
}

async function main(): Promise<void> {
  const timestamp = formatTimestamp();
  const logger = new FileLogger(`ships-game-${timestamp}.log`);
  const fleet = createFleet();

  const player1 = new Player('0001', 'player1', new Board({ width: 10, height: 10 }));
  const player2 = new Player('0002', 'player2', new Board({ width: 10, height: 10 }));

  const config: GameConfig = {
    board: { width: 10, height: 10 },
    fleet,
    logger,
  };

  const game = new Game(config);

  game.setupPlayers([player1, player2]);

  autoPlaceShips(player1, fleet, game);
  autoPlaceShips(player2, fleet, game);

  await game.start();

  // Output only minimal message to the console
  // eslint-disable-next-line no-console
  console.log('Game finished');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
