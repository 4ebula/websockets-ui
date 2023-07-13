import { PlayerInfo, PlayerRequestData } from '../models';
import { AlreadyLogged, EmptyFieldError, WrongPassword } from './errors';

export class Players {
  static instance: Players;
  private players: Map<number, PlayerInfo> = new Map();

  private constructor() {}

  setUser(username: string, password: string, index: number): PlayerInfo {
    const user = { username, password, index, isLogged: true };
    this.players.set(index, user);

    return { ...user, index };
  }

  getUser(index: number): PlayerInfo {
    return this.players.get(index);
  }

  isUserExists(userData: PlayerRequestData): PlayerInfo | null {
    try {
      const { name, password } = userData;
      this.validateUser(name, password);

      const user = [...this.players.values()].find(
        ({ username }) => username === userData.name
      );

      if (!user) {
        return null;
      }

      if (!this.checkPassword(userData.password, user.index)) {
        throw new WrongPassword();
      }

      if (user.isLogged) {
        throw new AlreadyLogged();
      }

      user.isLogged = true;
      return user;
    } catch (err) {
      throw err;
    }
  }

  setOffline(index: number): void {
    this.players.get(index).isLogged = false;
  }

  private checkPassword(pass: string, index: number): boolean {
    return this.players.get(index).password === pass;
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
