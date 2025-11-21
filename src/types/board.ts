import type { Coordinate, ShotResult, CellState } from './common';
import type { ShipInstance, ShipPlacement } from './ship';

export interface BoardConfig {
  width: number;
  height: number;
}

export interface BoardState {
  cells: CellState[][];
  ships: ShipInstance[];
  shotsFired: Coordinate[];
}

export interface Board {
  config: BoardConfig;
  state: BoardState;
  placeShip(placement: ShipPlacement): boolean;
  receiveShot(coordinate: Coordinate): ShotResult;
  allShipsSunk(): boolean;
}
