import type { BoardConfig } from './board';
import type { Player, PlayerId } from './player';
import type { ShotResult } from './common';
import type { ShipDefinition, ShipPlacement } from './ship';
import type { Logger } from '../logger/Logger';

export interface GameConfig {
  board: BoardConfig;
  fleet: ShipDefinition[];
  logger?: Logger;
}

export interface TurnState {
  activePlayerId: PlayerId;
  turnNumber: number;
}

export interface GameState {
  players: Record<PlayerId, Player>;
  turn: TurnState;
  winnerId?: PlayerId;
  history: ShotResult[];
}

export interface Game {
  config: GameConfig;
  state: GameState;
  setupPlayers(players: Player[]): void;
  placeShip(playerId: PlayerId, placement: ShipPlacement): boolean;
  start(): Promise<void>;
  takeTurn(): Promise<void>;
  isFinished(): boolean;
}
