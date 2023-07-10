import { GameData } from './games.model';

export enum WSMessageTypes {
  Reg = 'reg',
  CreateRoom = 'create_room',
  UpdateRoom = 'update_room',
  CreateGame = 'create_game',
  AddToRoom = 'add_user_to_room',
  Finish = 'finish',
  AddShips = 'add_ships',
  StartGame = 'start_game',
}

export interface BasicResponse {
  type: WSMessageTypes;
  data: unknown;
  id: 0;
}

export interface RegisterRequest {
  type: WSMessageTypes.Reg;
  // data: PlayerRequestData;
  data: string;
  id: number;
}

export interface PlayerRequestData {
  name: string;
  password: string;
}

export interface RegisterResponce {
  type: WSMessageTypes.Reg;
  data: RegisterResponceData;
  id: number;
}

export interface RegisterResponceData {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
}

export interface CreateRoomRequest {
  type: WSMessageTypes.CreateRoom;
  data: string;
  id: number;
}

export interface UpdateRoomRespose {
  type: WSMessageTypes.UpdateRoom;
  // data: Room
  data: string;
  id: 0;
}

export interface AddUser {
  type: WSMessageTypes.AddToRoom;
  // data:"{\"indexRoom\":1}";
  data: string;
  id: 0;
}

export interface AddShips {
  type: WSMessageTypes.AddShips;
  // data: GameData;
  data: string;
  id: 0;
}

export interface AddShipsUnparsed {
  type: WSMessageTypes.AddShips;
  data: GameData;
  id: 0;

}