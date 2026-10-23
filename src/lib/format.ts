export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getLocalTimeString(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function addDays(dateString: string, days: number): string {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);

  return getLocalDateString(date);
}

/** "10:00:00" -> "10:00" */
export function trimTime(timeString: string): string {
  return timeString.slice(0, 5);
}

export function formatTimeRange(start: string, end: string): string {
  return `${start} – ${end}`;
}

/** Apr 25, 2025 */
export function formatShortDate(dateString: string): string {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Tue, Apr 25, 2025 */
export function formatLongDate(dateString: string): string {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getEndDateTime(
    date: string,
    time: string,
    durationMinutes: number,
): { date: string; time: string } {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);

  const start = new Date(`${date}T00:00:00`);
  start.setHours(hours, minutes, 0, 0);

  const end = new Date(
      start.getTime() + durationMinutes * 60 * 1000,
  );

  return {
    date: getLocalDateString(end),
    time: getLocalTimeString(end),
  };
}

