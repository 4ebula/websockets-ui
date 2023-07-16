import { Game } from '../game';
import { GameId, GameInfo } from '../models';

export class Games {
  static instance: Games;
  private games: Map<number, Game> = new Map();
  private gamesCount = 0;

  private constructor() {}

  addGame(player1: number, player2: number, roomId: number): GameId {
    const gameId = this.gamesCount++;
    const game = new Game(gameId, roomId, [player1, player2]);

    this.games.set(gameId, game);
    return game.getGameId();
  }

  getGameById(gameId: GameId): Game {
    return this.games.get(gameId);
  }

  removeGame(gameId: GameId): void {
    this.games.delete(gameId);
  }

  findGameByPlayer(playerIndex: number): GameInfo {
    const entry = [...this.games.entries()].find(el =>
      el[1].getPlayers().find(player => player.index === playerIndex)
    );
    return entry ? entry[1].getGameInfo() : null;
  }


  static getInstance(): Games {
    if (!Games.instance) {
      Games.instance = new Games();
    }

    return Games.instance;
  }
}
