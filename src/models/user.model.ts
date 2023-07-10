export interface PlayerInfoBase {
  username: string;
  password: string;
}

export interface PlayerInfo extends PlayerInfoBase {
  index: number;
}

export interface UserRoomInfo {
  username: string;
  id: 0;
  index: number;
}