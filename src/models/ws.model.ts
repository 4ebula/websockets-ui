export enum WSMessageTypes {
  Reg = 'reg',
  CreateRoom = 'create_room',
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
