import { PlayerInfo } from 'src/models/user.model';
import { EmptyFieldError } from './errors';

export class Players {
  static instance: Players;
  private players: Map<number, PlayerInfo> = new Map();

  private constructor() {}

  setUser(username: string, password: string, index: number): PlayerInfo {
    try {
      this.validateUser(username, password);
      const user = { username, password, index };
      this.players.set(index, user);

      return { ...user, index };
    } catch (err) {
      throw err;
    }
  }

  getUser(index: number): PlayerInfo {
    return this.players.get(index);
  }

  deleteUser(index: number): void {
    this.players.delete(index);
  }

  private validateUser(username: string, password: string): void {
    if (!username) {
      throw new EmptyFieldError('username');
    }

    if (!password) {
      throw new EmptyFieldError('password');
    }
  }

  static getInstance(): Players {
    if (!Players.instance) {
      Players.instance = new Players();
    }

    return Players.instance;
  }
}
