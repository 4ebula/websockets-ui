import { ShipInfo, Coordinates } from '../models';

export class Ship {
  shipCoordinates: Coordinates[] = [];
  hits: boolean[] = [];
  killed = false;
  private shipEmptySpace: Coordinates[] = [];
  private shipLength: number;

  constructor(ship: ShipInfo) {
    // direction: false - vertival
    // !! direction: false - horizontal
    const {
      direction,
      length,
      position: { x, y },
    } = ship;
    this.shipLength = length;
    if (!direction) {
      // horizontal
      this.shipEmptySpace.push({ x: x - 1, y: y - 1 });
      this.shipEmptySpace.push({ x: x + length, y: y - 1 });
      this.shipEmptySpace.push({ x: x + length, y: y + 1 });
      this.shipEmptySpace.push({ x: x - 1, y: y + 1 });

      this.shipEmptySpace.push({ x: x + length, y });
      this.shipEmptySpace.push({ x: x - 1, y });

      for (let i = 0; i < length; i++) {
        this.shipCoordinates.push({ x: x + i, y });
        this.shipEmptySpace.push({ x: x + i, y: y + 1 });
        this.shipEmptySpace.push({ x: x + i, y: y - 1 });
      }
    } else {
      // vertical
      this.shipEmptySpace.push({ x: x - 1, y: y - 1 });
      this.shipEmptySpace.push({ x: x + 1, y: y - 1 });
      this.shipEmptySpace.push({ x: x + 1, y: y + length });
      this.shipEmptySpace.push({ x: x - 1, y: y + length });

      this.shipEmptySpace.push({ x, y: y - 1 });
      this.shipEmptySpace.push({ x, y: y + length });

      for (let i = 0; i < length; i++) {
        this.shipCoordinates.push({ x, y: y + i });
        this.shipEmptySpace.push({ x: x + 1, y: y + i });
        this.shipEmptySpace.push({ x: x - 1, y: y + i });
      }
    }
  }

  checkShipHits(coordinates: Coordinates): boolean {
    const { x: xAttack, y: yAttack } = coordinates;

    const hit = this.shipCoordinates.find(({ x, y }) => x === xAttack && y === yAttack);

    if (hit) {
      this.hits.push(true);
      this.checkIfShipIsSunk();
    }

    return !!hit;
  }

  checkIfCoordinatesOnShip(coordinates: Coordinates): boolean {
    return this.shipCoordinates.some(
      ({ x, y }) => x === coordinates.x && y === coordinates.y
    );
  }

  getEmptySpaces(): Coordinates[] {
    return this.shipEmptySpace;
  }

  private checkIfShipIsSunk(): void {
    this.killed = this.hits.length === this.shipLength;
  }
}
