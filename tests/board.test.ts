import { Board } from '../src/board/Board';
import type { BoardConfig } from '../src/types/board';
import type { ShipDefinition, ShipPlacement } from '../src/types/ship';
import type { Coordinate } from '../src/types/common';

describe('Board', () => {
  let board: Board;
  const boardConfig: BoardConfig = { width: 10, height: 10 };

  const createShipDefinition = (id: string, size: number): ShipDefinition => ({
    id,
    size,
  });

  const createShipPlacement = (
    id: string,
    size: number,
    bow: Coordinate,
    orientation: 'horizontal' | 'vertical'
  ): ShipPlacement => ({
    definition: createShipDefinition(id, size),
    bow,
    orientation,
  });

  beforeEach(() => {
    board = new Board(boardConfig);
  });

  describe('Valid Ship Placement', () => {
    it('should successfully place a horizontal ship', () => {
      const placement = createShipPlacement('battleship', 4, { x: 0, y: 0 }, 'horizontal');
      const result = board.placeShip(placement);
      expect(result).toBe(true);
      expect(board.state.ships).toHaveLength(1);
      expect(board.state.ships[0]?.definition.id).toBe('battleship');
    });

    it('should successfully place a vertical ship', () => {
      const placement = createShipPlacement('destroyer', 2, { x: 5, y: 5 }, 'vertical');
      const result = board.placeShip(placement);
      expect(result).toBe(true);
      expect(board.state.ships).toHaveLength(1);
    });

    it('should place multiple ships on the same board', () => {
      const ship1 = createShipPlacement('battleship', 4, { x: 0, y: 0 }, 'horizontal');
      const ship2 = createShipPlacement('destroyer', 2, { x: 0, y: 2 }, 'horizontal');

      expect(board.placeShip(ship1)).toBe(true);
      expect(board.placeShip(ship2)).toBe(true);
      expect(board.state.ships).toHaveLength(2);
    });

    it('should place a ship at the edge of the board', () => {
      const placement = createShipPlacement('ship', 2, { x: 8, y: 9 }, 'horizontal');
      const result = board.placeShip(placement);
      expect(result).toBe(true);
    });

    it('should place a ship at coordinates (0,0)', () => {
      const placement = createShipPlacement('ship', 3, { x: 0, y: 0 }, 'vertical');
      const result = board.placeShip(placement);
      expect(result).toBe(true);
    });
  });

  describe('Invalid Ship Placement', () => {
    it('should reject placement outside board bounds (horizontal)', () => {
      const placement = createShipPlacement('ship', 4, { x: 8, y: 0 }, 'horizontal');
      const result = board.placeShip(placement);
      expect(result).toBe(false);
      expect(board.state.ships).toHaveLength(0);
    });

    it('should reject placement outside board bounds (vertical)', () => {
      const placement = createShipPlacement('ship', 4, { x: 0, y: 8 }, 'vertical');
      const result = board.placeShip(placement);
      expect(result).toBe(false);
      expect(board.state.ships).toHaveLength(0);
    });

    it('should reject placement with negative coordinates', () => {
      const placement = createShipPlacement('ship', 3, { x: -1, y: 0 }, 'horizontal');
      const result = board.placeShip(placement);
      expect(result).toBe(false);
    });

    it('should reject placement beyond right edge', () => {
      const placement = createShipPlacement('ship', 5, { x: 6, y: 5 }, 'horizontal');
      const result = board.placeShip(placement);
      expect(result).toBe(false);
    });

    it('should reject placement beyond bottom edge', () => {
      const placement = createShipPlacement('ship', 5, { x: 5, y: 6 }, 'vertical');
      const result = board.placeShip(placement);
      expect(result).toBe(false);
    });
  });

  describe('Preventing Overlapping Ships', () => {
    it('should reject placement that overlaps with existing ship', () => {
      const ship1 = createShipPlacement('ship1', 3, { x: 0, y: 0 }, 'horizontal');
      const ship2 = createShipPlacement('ship2', 2, { x: 1, y: 0 }, 'horizontal');

      board.placeShip(ship1);
      const result = board.placeShip(ship2);

      expect(result).toBe(false);
      expect(board.state.ships).toHaveLength(1);
    });

    it('should reject placement that overlaps at the start', () => {
      const ship1 = createShipPlacement('ship1', 3, { x: 0, y: 0 }, 'horizontal');
      const ship2 = createShipPlacement('ship2', 2, { x: 0, y: 0 }, 'vertical');

      board.placeShip(ship1);
      const result = board.placeShip(ship2);

      expect(result).toBe(false);
      expect(board.state.ships).toHaveLength(1);
    });

    it('should reject placement that overlaps at the end', () => {
      const ship1 = createShipPlacement('ship1', 3, { x: 0, y: 0 }, 'horizontal');
      const ship2 = createShipPlacement('ship2', 2, { x: 2, y: 0 }, 'horizontal');

      board.placeShip(ship1);
      const result = board.placeShip(ship2);

      expect(result).toBe(false);
      expect(board.state.ships).toHaveLength(1);
    });

    it('should reject placement overlapping vertically', () => {
      const ship1 = createShipPlacement('ship1', 3, { x: 0, y: 0 }, 'vertical');
      const ship2 = createShipPlacement('ship2', 2, { x: 0, y: 1 }, 'vertical');

      board.placeShip(ship1);
      const result = board.placeShip(ship2);

      expect(result).toBe(false);
      expect(board.state.ships).toHaveLength(1);
    });

    it('should allow placement adjacent to existing ship', () => {
      const ship1 = createShipPlacement('ship1', 3, { x: 0, y: 0 }, 'horizontal');
      const ship2 = createShipPlacement('ship2', 2, { x: 3, y: 0 }, 'horizontal');

      board.placeShip(ship1);
      const result = board.placeShip(ship2);

      expect(result).toBe(true);
      expect(board.state.ships).toHaveLength(2);
    });

    it('should allow placement above existing ship', () => {
      const ship1 = createShipPlacement('ship1', 3, { x: 0, y: 1 }, 'horizontal');
      const ship2 = createShipPlacement('ship2', 2, { x: 0, y: 0 }, 'horizontal');

      board.placeShip(ship1);
      const result = board.placeShip(ship2);

      expect(result).toBe(true);
      expect(board.state.ships).toHaveLength(2);
    });
  });

  describe('Preventing Duplicate Shots', () => {
    beforeEach(() => {
      const ship = createShipPlacement('ship', 3, { x: 0, y: 0 }, 'horizontal');
      board.placeShip(ship);
    });

    it('should allow first shot at a location', () => {
      const result = board.receiveShot({ x: 0, y: 0 });
      expect(result.outcome).toBe('hit');
      expect(board.state.shotsFired).toHaveLength(1);
    });

    it('should prevent duplicate shots at same location', () => {
      board.receiveShot({ x: 0, y: 0 });
      const result = board.receiveShot({ x: 0, y: 0 });

      expect(board.state.shotsFired).toHaveLength(1);
      expect(result.outcome).toBe('hit');
    });

    it('should return same outcome for duplicate shots', () => {
      const result1 = board.receiveShot({ x: 0, y: 0 });
      const result2 = board.receiveShot({ x: 0, y: 0 });

      expect(result1.outcome).toBe(result2.outcome);
      expect(result1.outcome).toBe('hit');
    });

    it('should prevent duplicate shots on empty cells', () => {
      board.receiveShot({ x: 5, y: 5 });
      const result = board.receiveShot({ x: 5, y: 5 });

      expect(board.state.shotsFired).toHaveLength(1);
      expect(result.outcome).toBe('miss');
    });

    it('should distinguish between different shot locations', () => {
      board.receiveShot({ x: 0, y: 0 });
      board.receiveShot({ x: 1, y: 0 });

      expect(board.state.shotsFired).toHaveLength(2);
    });
  });

  describe('Hit / Miss / Sunk', () => {
    beforeEach(() => {
      const ship = createShipPlacement('destroyer', 2, { x: 0, y: 0 }, 'horizontal');
      board.placeShip(ship);
    });

    it('should return "hit" when shot strikes a ship', () => {
      const result = board.receiveShot({ x: 0, y: 0 });
      expect(result.outcome).toBe('hit');
    });

    it('should return "miss" when shot hits empty cell', () => {
      const result = board.receiveShot({ x: 5, y: 5 });
      expect(result.outcome).toBe('miss');
    });

    it('should return "miss" when shot is out of bounds', () => {
      const result = board.receiveShot({ x: 15, y: 15 });
      expect(result.outcome).toBe('miss');
    });

    it('should track hits on the ship', () => {
      board.receiveShot({ x: 0, y: 0 });
      const ship = board.state.ships[0];
      expect(ship?.hits).toHaveLength(1);
      expect(ship?.hits[0]).toEqual({ x: 0, y: 0 });
    });

    it('should return "sunk" when all cells of a ship are hit', () => {
      board.receiveShot({ x: 0, y: 0 });
      const result = board.receiveShot({ x: 1, y: 0 });

      expect(result.outcome).toBe('sunk');
      expect(result.shipId).toBe('destroyer');
      expect(result.shipSize).toBe(2);
    });

    it('should not return "sunk" until all cells are hit', () => {
      const result = board.receiveShot({ x: 0, y: 0 });
      expect(result.outcome).toBe('hit');
      expect(result.shipId).toBeUndefined();
    });

    it('should update cell state to hit when ship is struck', () => {
      board.receiveShot({ x: 0, y: 0 });
      expect(board.state.cells[0]?.[0]).toBe('hit');
    });

    it('should update cell state to miss when empty cell is shot', () => {
      board.receiveShot({ x: 5, y: 5 });
      expect(board.state.cells[5]?.[5]).toBe('miss');
    });

    it('should return sunk with ship details', () => {
      board.receiveShot({ x: 0, y: 0 });
      const result = board.receiveShot({ x: 1, y: 0 });

      expect(result.outcome).toBe('sunk');
      expect(result.shipId).toBe('destroyer');
      expect(result.shipSize).toBe(2);
    });

    it('should track multiple hits on same ship', () => {
      board.receiveShot({ x: 0, y: 0 });
      board.receiveShot({ x: 1, y: 0 });

      const ship = board.state.ships[0];
      expect(ship?.hits).toHaveLength(2);
    });
  });

  describe('Multiple Ships and Game State', () => {
    it('should track all ships sunk correctly', () => {
      const ship1 = createShipPlacement('ship1', 1, { x: 0, y: 0 }, 'horizontal');
      const ship2 = createShipPlacement('ship2', 1, { x: 5, y: 5 }, 'horizontal');

      board.placeShip(ship1);
      board.placeShip(ship2);

      expect(board.allShipsSunk()).toBe(false);

      board.receiveShot({ x: 0, y: 0 });
      expect(board.allShipsSunk()).toBe(false);

      board.receiveShot({ x: 5, y: 5 });
      expect(board.allShipsSunk()).toBe(true);
    });

    it('should return false for allShipsSunk when no ships are placed', () => {
      expect(board.allShipsSunk()).toBe(false);
    });

    it('should handle complex board scenarios', () => {
      const ship1 = createShipPlacement('battleship', 4, { x: 0, y: 0 }, 'horizontal');
      const ship2 = createShipPlacement('destroyer', 2, { x: 0, y: 3 }, 'horizontal');
      const ship3 = createShipPlacement('submarine', 3, { x: 5, y: 5 }, 'vertical');

      board.placeShip(ship1);
      board.placeShip(ship2);
      board.placeShip(ship3);

      expect(board.state.ships).toHaveLength(3);

      // Sink ship1
      for (let i = 0; i < 4; i++) {
        board.receiveShot({ x: i, y: 0 });
      }

      // Partial hits on ship2
      board.receiveShot({ x: 0, y: 3 });

      expect(board.allShipsSunk()).toBe(false);
    });

    it('should handle shots at various coordinates correctly', () => {
      const ship = createShipPlacement('ship', 2, { x: 2, y: 2 }, 'horizontal');
      board.placeShip(ship);

      const hits: Array<[Coordinate, string]> = [
        [{ x: 2, y: 2 }, 'hit'],
        [{ x: 3, y: 2 }, 'sunk'],
        [{ x: 0, y: 0 }, 'miss'],
        [{ x: 9, y: 9 }, 'miss'],
      ];

      const results = hits.map(([coord, _]) => board.receiveShot(coord));

      expect(results[0]?.outcome).toBe('hit');
      expect(results[1]?.outcome).toBe('sunk');
      expect(results[2]?.outcome).toBe('miss');
      expect(results[3]?.outcome).toBe('miss');
    });
  });
});
