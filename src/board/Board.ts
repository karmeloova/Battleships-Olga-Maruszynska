import type { Board as BoardInterface, BoardConfig, BoardState } from '../types/board';
import type { ShipPlacement, ShipInstance } from '../types/ship';
import type { Coordinate, ShotResult, CellState } from '../types/common';
import { Ship } from '../ship/Ship';

type Cell = {
  type: 'empty' | 'ship';
  shipId?: string;
  state: 'pristine' | 'hit' | 'miss';
};

// Deep equality for coordinates
function coordinatesEqual(a: Coordinate, b: Coordinate): boolean {
  return a.x === b.x && a.y === b.y;
}

export class Board implements BoardInterface {
  readonly config: BoardConfig;
  readonly state: BoardState;

  private grid: Cell[][];

  constructor(config: BoardConfig) {
    this.config = config;
    this.state = {
      cells: [],
      ships: [],
      shotsFired: [],
    };

    // Initialize grid and state.cells
    this.grid = [];
    this.state.cells = [];
    for (let y = 0; y < config.height; y++) {
      const row: Cell[] = [];
      const stateRow: CellState[] = [];
      for (let x = 0; x < config.width; x++) {
        row.push({ type: 'empty', state: 'pristine' });
        stateRow.push('empty');
      }
      this.grid.push(row);
      this.state.cells.push(stateRow);
    }
  }

  // --- Helpers to validate and access cells ---

  /** Returns whether a coordinate is in-bounds for this board */
  private isValidCoordinate(coord: Coordinate): boolean {
    return (
      coord.x >= 0 &&
      coord.x < this.config.width &&
      coord.y >= 0 &&
      coord.y < this.config.height
    );
  }

  /** Returns cell at coordinate, or undefined if out-of-bounds */
  private getCell({ x, y }: Coordinate): Cell | undefined {
    if (!this.isValidCoordinate({ x, y })) return undefined;
    const row = this.grid[y];
    if (!row) return undefined;
    return row[x];
  }

  /** Sets cell in grid and keeps state.cells in sync */
  private setCell({ x, y }: Coordinate, newCell: Cell): void {
    if (!this.isValidCoordinate({ x, y })) return;
    const row = this.grid[y];
    const stateRow = this.state.cells[y];
    if (!row || !stateRow) return;
    row[x] = newCell;
    stateRow[x] = this.cellToState(newCell);
  }

  /** Maps Cell type to CellState for syncing state.cells */
  private cellToState(cell: Cell): CellState {
    if (cell.type === 'ship') return cell.state === 'hit' ? 'hit' : 'ship';
    return cell.state === 'miss' ? 'miss' : 'empty';
  }

  /** Get array of Coordinates covered by a ShipPlacement */
  private coordinatesForPlacement(placement: ShipPlacement): Coordinate[] {
    const result: Coordinate[] = [];
    const { bow, orientation, definition } = placement;
    const dx = orientation === 'horizontal' ? 1 : 0;
    const dy = orientation === 'vertical' ? 1 : 0;

    for (let i = 0; i < definition.size; ++i) {
      result.push({ x: bow.x + i * dx, y: bow.y + i * dy });
    }
    return result;
  }

  /** Has a shot at coordinate already been fired? */
  private isDuplicateShot(coord: Coordinate): boolean {
    return this.state.shotsFired.some(
      shot => coordinatesEqual(shot, coord)
    );
  }

  /** Find the ship at a coordinate, if any. */
  private findShipAt(coord: Coordinate): { cell: Cell; ship?: ShipInstance } | undefined {
    const cell = this.getCell(coord);
    if (!cell || cell.type !== 'ship' || !cell.shipId) return undefined;
    const ship = this.state.ships.find(s => s.definition.id === cell.shipId);
    if (!ship) return undefined;
    return { cell, ship };
  }

  // --- Board methods ---

  placeShip(placement: ShipPlacement): boolean {
    const coords = this.coordinatesForPlacement(placement);

    // Validate placement: must all be valid & empty.
    for (const coord of coords) {
      if (!this.isValidCoordinate(coord)) return false;
      const cell = this.getCell(coord);
      if (!cell || cell.type === 'ship') return false;
    }

    // Place ship cells
    for (const coord of coords) {
      this.setCell(coord, {
        type: 'ship',
        shipId: placement.definition.id,
        state: 'pristine',
      });
    }

    // Track ship instance for hit tracking
    this.state.ships.push(new Ship(placement));
    return true;
  }

  receiveShot(coordinate: Coordinate): ShotResult {
    // Check for duplicate shots
    if (this.isDuplicateShot(coordinate)) {
      const cell = this.getCell(coordinate);
      const outcome: ShotResult['outcome'] = cell && cell.type === 'ship' && cell.state === 'hit'
        ? 'hit'
        : 'miss';
      return { coordinate: { ...coordinate }, outcome };
    }

    this.state.shotsFired.push({ ...coordinate });
    const cell = this.getCell(coordinate);

    let outcome: ShotResult['outcome'] = 'miss';

    if (cell && cell.type === 'ship') {
      // Register the hit
      cell.state = 'hit';
      this.setCell(coordinate, cell); // Syncs state

      const shipResult = this.findShipAt(coordinate);
      const ship = shipResult?.ship;
      if (ship) {
        // Add this hit if not tracked
        if (!ship.hits.some((hit: Coordinate) => coordinatesEqual(hit, coordinate))) {
          ship.hits.push({ ...coordinate });
        }
        outcome = ship.isSunk() ? 'sunk' : 'hit';
      } else {
        outcome = 'hit';
      }
    } else if (cell) {
      // Register the miss
      cell.state = 'miss';
      this.setCell(coordinate, cell); // Syncs state
      outcome = 'miss';
    } else {
      outcome = 'miss'; // Out-of-bounds treated as miss
    }

    const result: ShotResult = { coordinate: { ...coordinate }, outcome };

    if (outcome === 'sunk') {
      const { ship } = this.findShipAt(coordinate) || {};
      if (ship) {
        result.shipId = ship.definition.id;
        result.shipSize = ship.definition.size;
      }
    }

    return result;
  }

  allShipsSunk(): boolean {
    return (
      this.state.ships.length > 0 &&
      this.state.ships.every(ship => ship.isSunk())
    );
  }
}
