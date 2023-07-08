import { WebSocket, WebSocketServer } from 'ws';
import {
  WSMessageTypes,
  RegisterRequest,
  RegisterResponceData,
  PlayerRequestData,
} from '../models/ws.model';
import { Players } from '../db/player';

export class WSServer {
  private readonly webSocketServer: WebSocketServer;
  private readonly players = Players.getInstance();
  private ws: WebSocket;

  constructor(port: number = 3000) {
    this.webSocketServer = new WebSocketServer({ port });
  }

  run(): void {
    this.webSocketServer.on('connection', ws => {
      console.log('Connected');
      this.ws = ws;

      ws.on('message', data => {
        try {
          const msg = JSON.parse(data.toString());
          switch (msg.type) {
            case WSMessageTypes.Reg:
              this.handleReg(msg);
              break;
            case WSMessageTypes.CreateRoom:
              this.handleRoom(msg);
              break;
            default:
              break;
          }
        } catch {
          // TODO: Hanlde JSON error
        }
      });

      ws.on('error', err => {
        // TODO: handle error
      });
    });
  }

  close(): void {
    this.webSocketServer.close();
  }

  private handleReg(msg: RegisterRequest): void {
    try {
      const { name: username, password } = JSON.parse(msg.data) as PlayerRequestData;
      const { index } = this.players.setUser(username, password);

      const data: RegisterResponceData = {
        name: username,
        index,
        error: false,
        errorText: null,
      };
      const responceString = JSON.stringify({
        type: WSMessageTypes.Reg,
        data: JSON.stringify(data),
        id: 0,
      });

      this.ws.send(responceString);
    } catch (err) {
      const responceString = JSON.stringify({
        type: WSMessageTypes.Reg,
        data: this.createError(err),
        id: 0,
      });
      this.ws.send(responceString);
    }
  }

  private handleRoom(msg: any): void {}

  private createError(err: Error): string {
    return this.createDataString(null, null, true, err.message);
  }

  private createDataString(
    name: string,
    index: number,
    error: boolean = false,
    errorText: string | null = null
  ): string {
    return JSON.stringify({
      name,
      index,
      error,
      errorText,
    });
  }
}
