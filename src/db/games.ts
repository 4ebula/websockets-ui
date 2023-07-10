import { GameId, GameInfo, PlayersInfo } from '../models/games.model';

export class Games {
  static instance: Games;
  private games: Map<number, GameInfo> = new Map();
  private gamesCount = 0;

  private constructor() {}

  addGame(player1: number, player2: number, roomId: number): GameId {
    const gameId = this.gamesCount++;
    const players: PlayersInfo = [player1, player2];
    const game = {
      gameId,
      roomId,
      players,
    };
    this.games.set(gameId, game);
    return gameId;
  }

  findGameByPlayer(playerIndex: number): GameInfo {
    const entry = [...this.games.entries()].find(el =>
      el[1].players.includes(playerIndex)
    );
    return entry[1] ? entry[1] : null;
  }

  removeGame(gameId: GameId): void {
    this.games.delete(gameId);
  }

  static getInstance(): Games {
    if (!Games.instance) {
      Games.instance = new Games();
    }

    return Games.instance;
  }
}
