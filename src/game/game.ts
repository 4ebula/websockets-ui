import {
  AttackResponseStatus,
  Coordinates,
  GameId,
  PlayerGameInfo,
  ShipInfo,
} from '../models';
import { Ship } from './ship';

export class Game {
  private players: [PlayerGameInfo, PlayerGameInfo];

  constructor(
    private gameId: GameId,
    private roomId: number,
    playersIndexes: [number, number]
  ) {
    this.players = playersIndexes.map(this.createPlayer) as [
      PlayerGameInfo,
      PlayerGameInfo
    ];
  }

  getGameInfo() {
    return {
      gameId: this.gameId,
      roomId: this.roomId,
      players: this.players,
    };
  }

  getGameId(): GameId {
    return this.gameId;
  }

  getPlayers(): [PlayerGameInfo, PlayerGameInfo] {
    return this.players;
  }

  getPlayerByIndex(playerIndex: number): PlayerGameInfo {
    return this.players.find(player => player.index === playerIndex);
  }

  getFirstPlayer(): PlayerGameInfo {
    return this.players[0];
  }

  getOtherPlayer(playerIndex: number): PlayerGameInfo {
    return this.players.find(player => player.index !== playerIndex);
  }

  setShipsInfo(playerIndex: number, shipsInfo: ShipInfo[]): void {
    const player = this.getPlayerByIndex(playerIndex);
    player.shipsInfo = [...shipsInfo];

    if (!player.ships.length) {
      this.createShips(player, shipsInfo);
    }
  }

  createShips(player: PlayerGameInfo, shipsInfo: ShipInfo[]): void {
    shipsInfo.forEach(shipInfo => {
      const ship = new Ship(shipInfo);
      player.ships.push(ship);
    });
  }

  createPlayer(index: number): PlayerGameInfo {
    return {
      index,
      ships: [],
      shipsInfo: [],
      hits: [],
    };
  }

  makeAttack(playerIndex: number, attackCoordinates: Coordinates): AttackResponseStatus {
    const hitShip = this.getOtherPlayer(playerIndex).ships.find(ship =>
      ship.checkShipHits(attackCoordinates)
    );

    if (!hitShip) {
      return AttackResponseStatus.Miss;
    }

    if (!hitShip.killed) {
      return AttackResponseStatus.Shot;
    } else {
      return AttackResponseStatus.Killed;
    }
  }

  findShipEmptySpaces(
    playerIndex: number,
    coordinates: Coordinates
  ): Coordinates[] {
    const player = this.getPlayerByIndex(playerIndex);
    const sunkShip = player.ships.find(ship =>
      ship.checkIfCoordinatesOnShip(coordinates)
    );

    return sunkShip
      .getEmptySpaces();
  }

  isAllPlayerShipSunk(playerIndex: number): boolean {
    return this.getPlayerByIndex(playerIndex).ships.every(ship => ship.killed);
  }
}
