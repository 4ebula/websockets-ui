export interface ShipInfo{
  direction: boolean;
  type: ShipTypes;
  length: ShipLength;
  position: Coordinates;
}

export interface Coordinates {
  x: number;
  y: number;
}

export enum ShipTypes {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  Huge = 'huge',
}

export enum ShipLength {
  Small = 1,
  Medium = 2,
  Large = 3,
  Huge = 4,
}
