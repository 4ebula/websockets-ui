import { UUID, randomUUID } from 'crypto';
import { PlayerInfo, PlayerInfoExtended } from 'src/models/user.model';
import { EmptyFieldError } from './errors';

export class Players {
  static instance: Players;
  private players: Map<UUID, PlayerInfo> = new Map<UUID, PlayerInfo>();
  private ids: UUID[] = [];

  private constructor() {}

  setUser(username: string, password: string): PlayerInfoExtended {
    try {
      this.validateUser(username, password);
      const id = randomUUID();
      const user = { username, password, id };
      this.players.set(id, user);
      this.ids.push(id);

      return { ...user, index: this.ids.length - 1 };
    } catch (err) {
      throw err;
    }
  }

  validateUser(username: string, password: string): void {
    if (!username) {
      console.log('HERE1');
      throw new EmptyFieldError('username');
    }

    if (!password) {
      console.log('HERE2');
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
