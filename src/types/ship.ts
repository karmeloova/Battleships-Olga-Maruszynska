import type { Coordinate, Orientation } from './common';

export interface ShipDefinition {
  id: string;
  size: number;
}

export interface ShipPlacement {
  definition: ShipDefinition;
  bow: Coordinate;
  orientation: Orientation;
}

export interface ShipInstance {
  definition: ShipDefinition;
  coordinates: Coordinate[];
  hits: Coordinate[];
  isSunk(): boolean;
}