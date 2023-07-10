import { Room, UserRoomInfo } from '../models';

export class Rooms {
  static instance: Rooms;
  rooms: Map<number, Room> = new Map();

  private constructor() {}

  createRoom(): Room {
    const roomId = this.rooms.size + 1;
    const room: Room = { roomId, roomUsers: [] };
    this.rooms.set(roomId, room);

    return room;
  }

  addPlayerToRoom(roomId: number, user: UserRoomInfo): Room | null {
    const openedRoom = this.rooms.get(roomId);

    if (openedRoom.roomUsers.length < 2) {
      openedRoom.roomUsers.push({ name: user.username, index: user.index });
      return openedRoom;
    } else {
      return null;
    }
  }

  getRoom(roomIndex: number): Room {
    return this.rooms.get(roomIndex);
  }

  removeRoom(roomId: number): void {
    this.rooms.delete(roomId);
  }

  static getInstance(): Rooms {
    if (!Rooms.instance) {
      Rooms.instance = new Rooms();
    }

    return Rooms.instance;
  }
}
