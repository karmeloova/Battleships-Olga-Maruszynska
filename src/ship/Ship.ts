import type { ShipInstance, ShipPlacement, ShipDefinition } from '../types/ship';
import type { Coordinate } from '../types/common';

export class Ship implements ShipInstance {
  readonly definition: ShipDefinition;
  readonly coordinates: Coordinate[];
  readonly hits: Coordinate[];

  constructor(placement: ShipPlacement) {
    this.definition = placement.definition;
    this.hits = [];

    const { bow, orientation, definition } = placement;
    const coords: Coordinate[] = [];

    for (let i = 0; i < definition.size; i++) {
      if (orientation === "horizontal") {
        coords.push({ x: bow.x + i, y: bow.y });
      } else if (orientation === "vertical") {
        coords.push({ x: bow.x, y: bow.y + i });
      }
    }
    this.coordinates = coords;
  }

  isSunk(): boolean {
    return this.coordinates.every(coord =>
      this.hits.some(
        hit => hit.x === coord.x && hit.y === coord.y
      )
    );
  }
}
