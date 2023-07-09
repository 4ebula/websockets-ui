import { WebSocket, WebSocketServer } from 'ws';
import {
  WSMessageTypes,
  RegisterRequest,
  RegisterResponceData,
  PlayerRequestData,
  CreateRoomRequest,
} from '../models/ws.model';
import { Players } from '../db/player';
import { Rooms } from '../db/rooms';
import { PlayerInfoExtended } from '../models/user.model';
import { Room } from 'src/models/room.model';

export class WSServer {
  private readonly webSocketServer: WebSocketServer;
  private readonly players = Players.getInstance();
  private readonly rooms = Rooms.getInstance();
  // private currentUser: PlayerInfoExtended;
  private currentRoom: Room;
  private ws: WebSocket[] = [];

  constructor(private port: number = 3000) {
    this.webSocketServer = new WebSocketServer({ port: this.port, clientTracking: true });
  }

  run(): void {
    this.webSocketServer.on('connection', (ws: WebSocket) => {
      console.log(`WS connection opened on port ${this.port}`);
      this.ws.push(ws);

      const index = this.webSocketServer.clients.size - 1;

      ws.on('message', data => {
        try {
          const msg = JSON.parse(data.toString());
          switch (msg.type) {
            case WSMessageTypes.Reg:
              this.handleReg(msg, index);
              break;
            case WSMessageTypes.CreateRoom:
              this.handleCreateRoom(index);
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

      ws.on('close', () => {
        console.log('Connection closed');
      });
    });
  }

  close(): void {
    this.webSocketServer.close();
  }

  private handleReg(msg: RegisterRequest, index: number): void {
    try {
      const { name: username, password } = JSON.parse(msg.data) as PlayerRequestData;
      const user = this.players.setUser(username, password, index);

      const data: RegisterResponceData = {
        name: username,
        index: user.index,
        error: false,
        errorText: null,
      };
      const responceString = JSON.stringify({
        type: WSMessageTypes.Reg,
        data: JSON.stringify(data),
        id: user.index,
      });

      this.ws[index].send(responceString);
      this.updateRoom(index);
    } catch (err) {
      const responceString = JSON.stringify({
        type: WSMessageTypes.Reg,
        data: this.createError(err),
        id: 0,
      });
      this.ws[index].send(responceString);
    }
  }

  private handleCreateRoom(index: number): void {
    const room = this.rooms.createRoom();
    const user = this.players.getUser(index);
    this.rooms.addPlayerToRoom(room.roomId, {
      username: user.username,
      index: index,
      id: null,
    });

    this.currentRoom = room;

    this.updateRoom(index);
  }

  private updateRoom(index?: number): void {
    const user = this.players.getUser(index);
    const data: Room[] = [
      {
        roomId: this.currentRoom.roomId,
        roomUsers: [
          {
            name: user.username,
            index: index,
          },
        ],
      },
    ];
    const res = {
      type: WSMessageTypes.UpdateRoom,
      data: JSON.stringify(this.currentRoom ? data : []),
      id: 0,
    };

    if (!index) {
      this.ws.forEach(socket => socket.send(JSON.stringify(res)));
    } else {
      this.ws[index].send(JSON.stringify(res));
    }
  }

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
