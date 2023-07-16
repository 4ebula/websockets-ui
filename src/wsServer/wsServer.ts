/* eslint-disable no-console */
import { WebSocket, WebSocketServer } from 'ws';
import {
  WSMessageTypes,
  RegisterRequest,
  RegisterResponceData,
  PlayerRequestData,
  AddUser,
  AddShips,
  GameData,
  BasicResponse,
  PlayerInfo,
  AttackRequestData,
  AttackRequest,
  AttackResponseStatus,
  Coordinates,
  RandomAttackRequestData,
} from '../models';
import { Players, Rooms, Games, Winners } from '../db';

export class WSServer {
  private readonly webSocketServer: WebSocketServer;
  private readonly players = Players.getInstance();
  private readonly rooms = Rooms.getInstance();
  private readonly games = Games.getInstance();
  private readonly winners = Winners.getInstance();
  private ws: Map<number, WebSocket> = new Map();
  private counter = 0;

  constructor(private port: number = 3000) {
    this.webSocketServer = new WebSocketServer({ port: this.port, clientTracking: true });
  }

  run(): void {
    this.webSocketServer.on('connection', (ws: WebSocket) => {
      console.log(`WS connection opened on port ${this.port}`);

      let index = this.counter++;
      this.ws.set(index, ws);

      ws.on('message', data => {
        try {
          const msg = JSON.parse(data.toString());
          switch (msg.type) {
            case WSMessageTypes.Reg:
              {
                try {
                  const existingUser = this.players.isUserExists(JSON.parse(msg.data));

                  if (existingUser) {
                    this.ws.delete(index);
                    index = existingUser.index;
                    this.ws.set(index, ws);
                    this.counter--;
                    this.createRegResponse(index, existingUser);
                  } else {
                    this.handleNewUser(msg, index);
                  }
                  this.sendWinner(ws);
                } catch (err) {
                  this.createRegError(index, err);
                }
              }
              break;
            case WSMessageTypes.CreateRoom:
              this.handleCreateRoom(index);
              break;
            case WSMessageTypes.AddToRoom:
              this.handleAddToRoom(index, msg);
              break;
            case WSMessageTypes.AddShips:
              this.handleAddShips(index, msg);
              break;
            case WSMessageTypes.Attack:
              {
                const data = JSON.parse(msg.data) as AttackRequestData;
                this.handleAttack(index, data);
              }
              break;
            case WSMessageTypes.RandomAttack:
              this.handleRandomAttack(index, msg);
              break;
            default:
              break;
          }
        } catch (err) {
          const errMsg = this.createError(err);
          ws.send(errMsg);
        }
      });

      ws.on('error', err => {
        console.log(err);
      });

      ws.on('close', () => {
        this.checkCurrentGames(index);
        this.players.setOffline(index);
        this.ws.delete(index);
        console.log('Connection closed');
      });
    });
  }

  close(): void {
    this.webSocketServer.close();
  }

  private handleNewUser(msg: RegisterRequest, index: number): void {
    try {
      const { name: username, password } = JSON.parse(msg.data) as PlayerRequestData;
      const user = this.players.setUser(username, password, index);

      this.createRegResponse(index, user);
    } catch (err) {
      this.createRegError(index, err);
    }
  }

  private createRegResponse(index: number, user: PlayerInfo): void {
    const data: RegisterResponceData = {
      name: user.username,
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
    this.updateRoom();
  }

  private createRegError(index: number, err: Error): void {
    const responceString = JSON.stringify({
      type: WSMessageTypes.Reg,
      data: this.createError(err),
      id: 0,
    });
    this.ws.get(index).send(responceString);
  }

  private handleCreateRoom(index: number): void {
    const room = this.rooms.createRoom();
    const user = this.players.getUser(index);
    this.rooms.addPlayerToRoom(room.roomId, {
      username: user.username,
      index: index,
      id: 0,
    });

    this.updateRoom();
  }

  private updateRoom(): void {
    const rooms = this.rooms.getOpenedRooms();
    const res = {
      type: WSMessageTypes.UpdateRoom,
      data: JSON.stringify(rooms.length ? rooms : []),
      id: 0,
    };

    this.ws.forEach(socket => socket.send(JSON.stringify(res)));
  }

  private handleAddToRoom(playerIndex: number, msg: AddUser): void {
    const { indexRoom: roomIndex } = JSON.parse(msg.data);
    const room = this.rooms.getRoom(roomIndex);

    const playerWs = this.ws.get(playerIndex);

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
      this.updateRoom();
    }
  }

  private handleAddShips(playerIndex: number, msg: AddShips): void {
    const { gameId, ships } = JSON.parse(msg.data) as GameData;
    const game = this.games.getGameById(gameId);

    game.setShipsInfo(playerIndex, ships);

    if (game.getPlayers().every(player => player.ships.length)) {
      const otherPlayerIndex = game.getOtherPlayer(playerIndex).index;

      game.getPlayers().forEach(({ index, shipsInfo }) => {
        const payload = this.stringifyResponceWithData({
          type: WSMessageTypes.StartGame,
          data: {
            ships: shipsInfo,
            currentPlayerIndex: index,
          },
          id: 0,
        });

        this.ws.get(index).send(payload);
      });

      const firstPlayer = game.getFirstPlayer();
      this.sendTurn(firstPlayer.index, otherPlayerIndex);
    }
  }

  private sendTurn(playerIndex: number, otherPlayerIndex: number): void {
    const data = JSON.stringify({
      currentPlayer: playerIndex,
    });

    [this.ws.get(playerIndex), this.ws.get(otherPlayerIndex)].forEach(ws =>
      ws.send(
        JSON.stringify({
          type: WSMessageTypes.Turn,
          data,
          id: 0,
        })
      )
    );
  }

  private handleAttack(playerIndex: number, data: AttackRequestData): void {
    const { gameId, x, y } = data;

    const game = this.games.getGameById(gameId);

    const otherPlayer = game.getOtherPlayer(playerIndex);

    const hit = game.makeAttack(playerIndex, { x, y });

    const playersWs = [this.ws.get(playerIndex), this.ws.get(otherPlayer.index)];

    playersWs.forEach(ws => {
      this.sendAttack(ws, playerIndex, { x, y }, hit);
    });

    switch (hit) {
      case AttackResponseStatus.Miss:
        this.sendTurn(otherPlayer.index, playerIndex);
        break;
      case AttackResponseStatus.Shot:
        this.sendTurn(playerIndex, otherPlayer.index);
        break;
      case AttackResponseStatus.Killed:
        {
          const epmtySpaces = game.findShipEmptySpaces(otherPlayer.index, { x, y });
          playersWs.forEach(ws => {
            epmtySpaces.forEach(coordinates => {
              this.sendAttack(ws, playerIndex, coordinates, AttackResponseStatus.Miss);
            });
          });

          const isEveryShipKilled = game.isAllPlayerShipSunk(otherPlayer.index);

          if (isEveryShipKilled) {
            this.winners.addWin(playerIndex);
            const msg = this.createFinishGameResponce(playerIndex);
            playersWs.forEach(ws => {
              ws.send(msg);
              this.sendWinner(ws);
            });
            this.games.removeGame(gameId);
            this.rooms.removeRoom(game.getGameInfo().roomId);
          } else {
            this.sendTurn(playerIndex, otherPlayer.index);
          }
        }
        break;
    }
  }

  private handleRandomAttack(playerIndex: number, msg: AttackRequest): void {
    const { gameId } = JSON.parse(msg.data) as RandomAttackRequestData;

    const game = this.games.getGameById(gameId);

    const { x, y } = game.findPlaceToHit(playerIndex);

    this.handleAttack(playerIndex, { gameId, x, y, indexPlayer: playerIndex });
  }

  private sendWinner(ws: WebSocket): void {
    const winners = this.winners.getWinners();
    ws.send(
      JSON.stringify({
        type: WSMessageTypes.UpdateWinners,
        data: JSON.stringify(winners),
        id: 0,
      })
    );
  }

  private sendAttack(
    ws: WebSocket,
    playerIndex: number,
    position: Coordinates,
    status: AttackResponseStatus
  ): void {
    const payload = JSON.stringify({
      type: WSMessageTypes.Attack,
      data: JSON.stringify({
        position,
        currentPlayer: playerIndex,
        status,
      }),
      id: 0,
    });
    ws.send(payload);
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
      const { gameId, roomId, players } = currentGame;
      const [{ index: player1 }, { index: player2 }] = players;
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

  private stringifyResponceWithData(payload: BasicResponse): string {
    const { data, ...rest } = payload;

    return JSON.stringify({
      ...rest,
      data: JSON.stringify(data),
    });
  }
}
