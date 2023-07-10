import { WebSocket, WebSocketServer } from 'ws';
import {
  WSMessageTypes,
  RegisterRequest,
  RegisterResponceData,
  PlayerRequestData,
  AddUser,
} from '../models/ws.model';
import { Players } from '../db/player';
import { Rooms } from '../db/rooms';
import { Room } from '../models/room.model';
import { Games } from '../db/games';

export class WSServer {
  private readonly webSocketServer: WebSocketServer;
  private readonly players = Players.getInstance();
  private readonly rooms = Rooms.getInstance();
  private readonly games = Games.getInstance();
  private currentRoom: Room;
  private ws: Map<number, WebSocket> = new Map();
  private counter = 0;

  constructor(private port: number = 3000) {
    this.webSocketServer = new WebSocketServer({ port: this.port, clientTracking: true });
  }

  run(): void {
    this.webSocketServer.on('connection', (ws: WebSocket) => {
      console.log(`WS connection opened on port ${this.port}`);

      const index = this.counter++;
      this.ws.set(index, ws);

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
            case WSMessageTypes.AddToRoom:
              this.handleAddToRoom(index, msg);
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
        this.checkCurrentGames(index);
        this.ws.delete(index);
        this.players.deleteUser(index);
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

      this.ws.get(index).send(responceString);
      this.updateRoom(index);
    } catch (err) {
      const responceString = JSON.stringify({
        type: WSMessageTypes.Reg,
        data: this.createError(err),
        id: 0,
      });
      this.ws.get(index).send(responceString);
    }
  }

  private handleCreateRoom(index: number): void {
    const room = this.rooms.createRoom();
    const user = this.players.getUser(index);
    this.rooms.addPlayerToRoom(room.roomId, {
      username: user.username,
      index: index,
      id: 0,
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

    this.ws.forEach(socket => socket.send(JSON.stringify(res)));
    // if (!index) {
    // } else {
    //   this.ws.get(index).send(JSON.stringify(res));
    // }
  }

  private handleAddToRoom(playerIndex: number, msg: AddUser): void {
    const { indexRoom: roomIndex } = JSON.parse(msg.data);
    const room = this.rooms.getRoom(roomIndex);

    const playerWs = this.ws.get(playerIndex);

    console.log(playerIndex);
    console.log(room);

    if (!room) {
      const err = this.createDataString(null, null, true, 'Room does not exist');
      playerWs.send(JSON.stringify(err));
      return;
    }

    if (room.roomUsers.length >= 2) {
      const err = this.createDataString(null, null, true, 'Room already full');
      playerWs.send(JSON.stringify(err));
      return;
    }

    if (room.roomUsers.find(user => user.index === playerIndex)) {
      const err = this.createDataString(
        null,
        null,
        true,
        'You are already in room. Wait for another player'
      );
      playerWs.send(JSON.stringify(err));
      return;
    }

    const user = this.players.getUser(playerIndex);
    this.rooms.addPlayerToRoom(roomIndex, { ...user, id: 0 });

    if (room.roomUsers.length === 2) {
      const usersWs: [WebSocket, number][] = room.roomUsers.map(user => [
        this.ws.get(user.index),
        user.index,
      ]);
      const [player1, player2] = usersWs.map(([_, playerIndex]) => playerIndex);
      const gameId = this.games.addGame(player1, player2, room.roomId);
      usersWs.forEach(([userWs, playerIndex]) => {
        userWs.send(
          JSON.stringify({
            type: WSMessageTypes.CreateGame,
            data: JSON.stringify({
              idGame: gameId,
              idPlayer: playerIndex,
            }),
            id: 0,
          })
        );
      });
    }
  }

  private createFinishGameResponce(winnerId: number): string {
    return JSON.stringify({
      type: WSMessageTypes.Finish,
      data: JSON.stringify({
        winPlayer: winnerId,
      }),
      id: 0,
    });
  }

  private checkCurrentGames(disconnectIndex: number): void {
    const currentGame = this.games.findGameByPlayer(disconnectIndex);

    if (currentGame) {
      const {
        gameId,
        roomId,
        players: [player1, player2],
      } = currentGame;
      const winnerId = player1 === disconnectIndex ? player2 : player1;
      const msg = this.createFinishGameResponce(winnerId);
      this.ws.get(winnerId).send(msg);
      this.games.removeGame(gameId);
      this.rooms.removeRoom(roomId);
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
