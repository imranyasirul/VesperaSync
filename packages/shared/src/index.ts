export enum MessageType {
  SYNC = 0,
  AWARENESS = 1,
  AUTH = 2,
  ERROR = 3,
}

export interface CursorPresence {
  userId: string;
  name: string;
  color: string;
  x: number;
  y: number;
  selectionStart?: number;
  selectionEnd?: number;
}
