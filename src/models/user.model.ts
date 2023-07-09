import { UUID } from 'crypto';

export interface PlayerInfoBase {
  username: string;
  password: string;
}

export interface PlayerInfo extends PlayerInfoBase {
  id: UUID;
}

export interface PlayerInfoExtended extends PlayerInfoBase {
  index: number;
}

export interface UserRoomInfo {
  username: string;
  id: UUID;
  index: number;
}