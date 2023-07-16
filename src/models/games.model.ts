import { Ship } from '../game/ship';
import { Coordinates, ShipInfo } from './ships.model';

export interface GameInfo {
  gameId: GameId;
  roomId: number;
  players: [PlayerGameInfo, PlayerGameInfo];
}

export interface PlayerGameInfo {
  index: number;
  shipsInfo: ShipInfo[];
  ships: Ship[];
  hits: Coordinates[];
}

export type GameId = number;

export interface GameData {
  gameId: number;
  ships: ShipInfo[];
  indexPlayer: number;
}
