import type { Board } from './board';
import type { Coordinate, ShotResult } from './common';

export type PlayerId = string;

export interface Player {
  id: PlayerId;
  name: string;
  board: Board;
  takeTurn(opponent: Player): Promise<Coordinate>;
  handleShot(coordinate: Coordinate): ShotResult;
}