import { UserRoomInfo } from 'src/models/user.model';
import { Room } from '../models/room.model';

export class Rooms {
  static instance: Rooms;
  rooms: Room[] = [];

  private constructor() {}

  createRoom(): Room {
    const roomId = this.rooms.length + 1;
    const room: Room = { roomId, roomUsers: [] }
    this.rooms.push(room);

    return room;
  }

  addPlayerToRoom(roomId: number, user: UserRoomInfo): void {
    const openedRoom = this.rooms.find(room => room.roomId === roomId);

    if (openedRoom.roomUsers.length < 2) {
      openedRoom.roomUsers.push({ name: user.username, index: user.index });
    }
  }

  static getInstance(): Rooms {
    if (!Rooms.instance) {
      Rooms.instance = new Rooms();
    }

    return Rooms.instance;
  }
}

// export interface Room {
//   roomId: number;
//   roomUsers: RoomUser[];
// }

// export interface RoomUser {
//   name: string;
//   index: number;
// }
