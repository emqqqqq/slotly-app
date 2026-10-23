export type Slot = {
  id: number;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM (24h) */
  startTime: string;
  /** HH:MM (24h), calculated from startTime + duration */
  endTime: string;
  duration: number;
  isBooked: boolean;
};

export type Page = "book" | "manage";

export type ApiResult = { ok: true } | { ok: false; message: string };
