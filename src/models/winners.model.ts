export interface Winner {
  name: string;
  wins: number;
}

export interface WinnerEntry extends Winner {
  index: number;
}
