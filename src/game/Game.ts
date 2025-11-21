import type { Game as GameInterface, GameConfig, GameState } from '../types/game';
import type { Player, PlayerId } from '../types/player';
import type { ShipPlacement } from '../types/ship';
import type { Logger } from '../logger/Logger';

export class Game implements GameInterface {
  readonly config: GameConfig;
  readonly state: GameState;

  private logger?: Logger;

  private _firstPlayerId: PlayerId | undefined;

  constructor(config: GameConfig) {
    this.config = config;
    this.state = {
      players: {},
      turn: {
        activePlayerId: '' as PlayerId,
        turnNumber: 0,
      },
      history: [],
    };
    if (config.logger) {
      this.logger = config.logger;
    }
  }

  setupPlayers(players: Player[]): void {
    for (const player of players) {
      this.state.players[player.id] = player;
    }
    const firstPlayer = players[0];
    if (firstPlayer) {
      this.state.turn.activePlayerId = firstPlayer.id;
      this._firstPlayerId = firstPlayer.id;
    }
  }

  placeShip(playerId: PlayerId, placement: ShipPlacement): boolean {
    const player = this.state.players[playerId];
    if (!player) return false;
    
    const placed = player.board.placeShip(placement);
    if (!placed) {
      return false;
    }
    
    if (this._firstPlayerId === playerId)
    {
      this.logger?.logPlaceShip?.({
        size: placement.definition.size,
        pos: { x: placement.bow.x, y: placement.bow.y },
        dir: placement.orientation,
      });
    }

    return true;
  }

  async start(): Promise<void> {
    while (!this.isFinished()) {
      await this.takeTurn();
    }
    // After the game is finished
    const firstPlayerId = this._firstPlayerId;
    if (!firstPlayerId) return; // Defensive

    const playerIds = Object.keys(this.state.players) as PlayerId[];
    if (playerIds.length < 2) return;

    const secondPlayerId = playerIds.find(pid => pid !== firstPlayerId)!;
    const winnerId = this.state.winnerId!;
    const loserId = playerIds.find(pid => pid !== winnerId)!;

    const player1 = this.state.players[firstPlayerId];
    const player2 = this.state.players[secondPlayerId];

    // Total shots for logging
    const player1Shots = this.state.history.filter(
      (shot, idx) => (idx % 2 === 0 && firstPlayerId === playerIds[0]) || (idx % 2 === 1 && firstPlayerId === playerIds[1])
    ).length;
    const player2Shots = this.state.history.length - player1Shots;

    // logGameOver result relative to player1
    let result: "win" | "lose" = "lose";
    if (this.state.winnerId === firstPlayerId) result = "win";
    this.logger?.logGameOver?.({
      result,
      "total-shots": player1Shots,
      "enemy-total-shots": player2Shots
    });

    // logEnemyShip for each ship of the losing player
    const losingPlayer = this.state.players[loserId];
    if (losingPlayer?.board?.state?.ships) {
      for (const ship of losingPlayer.board.state.ships) {
        // Ship bow at coordinates[0]
        const firstCoord = ship.coordinates[0];
        if (!firstCoord) continue;
        const secondCoord = ship.coordinates[1];
        const dir = ship.coordinates.length === 1
          ? "horizontal"
          : secondCoord && firstCoord.x === secondCoord.x
          ? "vertical"
          : "horizontal";
        this.logger?.logEnemyShip?.({
          size: ship.definition.size,
          pos: { x: firstCoord.x, y: firstCoord.y },
          dir
        });
      }
    }
  }

  async takeTurn(): Promise<void> {
    const { activePlayerId } = this.state.turn;
    const playerIds = Object.keys(this.state.players) as PlayerId[];
    if (!activePlayerId || playerIds.length < 2) return;

    const firstPlayerId = this._firstPlayerId!;
    const activePlayer = this.state.players[activePlayerId];
    const opponentId = playerIds.find(pid => pid !== activePlayerId)!;
    const opponent = this.state.players[opponentId];

    if (!activePlayer || !opponent) return;

    // Await coordinate from active player
    const coord = await activePlayer.takeTurn(opponent);

    // Fire shot
    const shotResult = opponent.handleShot(coord);
    this.state.history.push(shotResult);

    // Figure out correct logger callback and context:
    // logShot: when active player is first player
    // logEnemyShot: when opponent is first player
    const logCtx: any = {
      pos: { x: coord.x, y: coord.y },
      result: shotResult.outcome,
    };
    if (shotResult.outcome === "sunk" && "shipSize" in shotResult) {
      logCtx["ship-size"] = shotResult.shipSize;
    }
    if (activePlayerId === firstPlayerId) {
      this.logger?.logShot?.(logCtx);
    } else {
      this.logger?.logEnemyShot?.(logCtx);
    }

    // If opponent lost all ships, set winner
    if (opponent.board.allShipsSunk()) {
      this.state.winnerId = activePlayerId;
    }

    // Switch turn and increment turnNumber
    this.state.turn.activePlayerId = opponentId;
    this.state.turn.turnNumber += 1;
  }

  isFinished(): boolean {
    return !!this.state.winnerId;
  }
}
