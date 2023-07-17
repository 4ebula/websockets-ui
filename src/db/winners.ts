import { Winner, WinnerEntry } from '../models';
import { Players } from './player';

export class Winners {
  static instance: Winners;
  winners: Map<number, WinnerEntry> = new Map();

  private readonly players = Players.getInstance();

  private constructor() {}

  addWin(playersIndex: number): void {
    const winner = this.winners.get(playersIndex);
    if (winner) {
      winner.wins++;
    } else {
      const winInfo = {
        index: playersIndex,
        name: this.players.getUser(playersIndex).username,
        wins: 1,
      };
      this.winners.set(playersIndex, winInfo);
    }
  }

  getWinners(): Winner[] {
    return [...this.winners.values()]
      .map(({ name, wins }) => ({ name, wins }))
      .sort((a, b) => b.wins - a.wins);
  }

  static getInstance(): Winners {
    if (!Winners.instance) {
      Winners.instance = new Winners();
    }

    return Winners.instance;
  }
}
