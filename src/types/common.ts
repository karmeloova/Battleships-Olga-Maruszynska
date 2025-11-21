// Shared primitives and helper types for the Battleships game.

export interface Coordinate {
  x: number;
  y: number;
}

export type Orientation = 'horizontal' | 'vertical';

export type CellState = 'empty' | 'ship' | 'hit' | 'miss';

export interface ShotResult {
  coordinate: Coordinate;
  outcome: 'hit' | 'miss' | 'sunk';
  shipId?: string;
  shipSize?: number;
}