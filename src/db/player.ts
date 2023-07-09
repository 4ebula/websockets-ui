import { randomUUID } from 'crypto';
import { PlayerInfo, PlayerInfoExtended } from 'src/models/user.model';
import { EmptyFieldError } from './errors';

export class Players {
  static instance: Players;
  private players: Map<number, PlayerInfo> = new Map();

  private constructor() {}

  setUser(username: string, password: string, index: number): PlayerInfoExtended {
    try {
      this.validateUser(username, password);
      const id = randomUUID();
      const user = { username, password, id };
      this.players.set(index, user);

      return { ...user, index };
    } catch (err) {
      throw err;
    }
  }

  getUser(index: number): PlayerInfo {
    return this.players.get(index);
  }

  validateUser(username: string, password: string): void {
    if (!username) {
      throw new EmptyFieldError('username');
    }

    if (!password) {
      throw new EmptyFieldError('password');
    }

    // if (this.players.length && this.players[0].username === username) {
    //   throw new DuplicatedUser();
    // }
  }

  static getInstance(): Players {
    if (!Players.instance) {
      Players.instance = new Players();
    }

    return Players.instance;
  }
}
