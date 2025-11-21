import type { Player as PlayerInterface } from '../types/player';
import type { Coordinate, ShotResult } from '../types/common';
import { Board } from '../board/Board';

export class Player implements PlayerInterface {
  readonly id: string;
  readonly name: string;
  readonly board: Board;

  constructor(id: string, name: string, board: Board) {
    this.id = id;
    this.name = name;
    this.board = board;
  }

  async takeTurn(opponent: PlayerInterface): Promise<Coordinate> {
    const width = opponent.board.config.width;
    const height = opponent.board.config.height;

    // Flat list of all coordinates on opponent board
    const allCoordinates: Coordinate[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        allCoordinates.push({ x, y });
      }
    }

    // Filter out coordinates already shot by this player
    // (Player's board tracks the shots this player has made)
    const fired = opponent.board.state.shotsFired;
    const isFired = (coord: Coordinate) =>
      fired.some(f => f.x === coord.x && f.y === coord.y);

    const available = allCoordinates.filter(coord => !isFired(coord));

    if (available.length === 0) {
      // Fallback: Shouldn't happen, but return (0,0)
      return { x: 0, y: 0 };
    }

    // Pick a random available coordinate
    const idx = Math.floor(Math.random() * available.length);
    const selected = available[idx];
    if (!selected) {
      // Fallback: Shouldn't happen, but return (0,0)
      return { x: 0, y: 0 };
    }
    return selected;
  }

  handleShot(coordinate: Coordinate): ShotResult {
    return this.board.receiveShot(coordinate);
  }
}

