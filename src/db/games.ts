import { GameId, GameInfo, PlayerGameInfo } from '../models';

export class Games {
  static instance: Games;
  private games: Map<number, GameInfo> = new Map();
  private gamesCount = 0;

  private constructor() {}

  addGame(player1: number, player2: number, roomId: number): GameId {
    const gameId = this.gamesCount++;
    const players = [player1, player2].map(
      this.createPlayer
    ) as [PlayerGameInfo, PlayerGameInfo];
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
      el[1].players.find(player => player.index === playerIndex)
    );
    return entry ? entry[1] : null;
  }

  getGameById(gameId: GameId): GameInfo {
    return this.games.get(gameId);
  }

  removeGame(gameId: GameId): void {
    this.games.delete(gameId);
  }

  createPlayer(index: number): PlayerGameInfo {
    return {
      index,
      ships: [],
    };
  }

  static getInstance(): Games {
    if (!Games.instance) {
      Games.instance = new Games();
    }

    return Games.instance;
  }
}
