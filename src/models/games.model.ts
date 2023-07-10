export interface GameInfo {
  gameId: GameId;
  roomId: number;
  players: PlayersInfo;
}

export type PlayersInfo = [number, number];

export type GameId = number;
