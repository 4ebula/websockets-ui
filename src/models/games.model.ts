export interface GameInfo {
  gameId: GameId;
  roomId: number;
  players: [PlayerGameInfo, PlayerGameInfo];
}

export interface PlayerGameInfo {
  index: number;
  ships: Ship[];
}

export type GameId = number;

export interface Ship {
  direction: boolean;
  type: ShipTypes;
  length: ShipLength;
  position: {
    x: number;
    y: number;
  };
}

export enum ShipTypes {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  Huge = 'huge',
}

export enum ShipLength {
  Small = 1,
  Medium = 2,
  Large = 3,
  Huge = 4,
}

export interface GameData {
  gameId: number;
  ships: Ship[];
  indexPlayer: number;
}
