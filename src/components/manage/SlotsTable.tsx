import { AlertCircle, CalendarDays, LoaderCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/StatusBadge";
import { formatShortDate, formatTimeRange } from "../../lib/format";
import type { Slot } from "../../types";

type Props = {
  slots: Slot[];
  loading: boolean;
  error: string;
  filtered: boolean;
  onRetry: () => void;
  onAdd: () => void;
};

export function SlotsTable({ slots, loading, error, filtered, onRetry, onAdd }: Props) {
  if (loading) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center text-[#64748B]">
        <LoaderCircle size={28} className="animate-spin text-[#4F46E5]" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium">Loading slots...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
        <AlertCircle size={28} className="text-[#DC2626]" aria-hidden="true" />
        <p className="mt-3 max-w-sm text-sm text-[#64748B]">{error}</p>
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-4">
          Try again
        </Button>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
        <CalendarDays size={30} className="text-[#818CF8]" aria-hidden="true" />
        <h3 className="mt-3 font-semibold">
          {filtered ? "No slots on this date" : "No slots yet"}
        </h3>
        <p className="mt-1 text-sm text-[#64748B]">
          {filtered
            ? "Clear the filter or add a slot for this day."
            : "Create your first slot so people can start booking."}
        </p>
        <Button size="sm" onClick={onAdd} className="mt-4">
          Add New Slot
        </Button>
      </div>
    );
  }

  return (
    <>
      <table className="hidden w-full text-left text-sm md:table">
        <caption className="sr-only">Your time slots</caption>
        <thead className="bg-[#F8FAFC] text-xs font-semibold text-[#64748B]">
          <tr>
            <th scope="col" className="px-6 py-3">Date</th>
            <th scope="col" className="px-6 py-3">Time</th>
            <th scope="col" className="px-6 py-3">Duration</th>
            <th scope="col" className="px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {slots.map((slot) => (
            <tr key={slot.id} className="transition-colors duration-150 hover:bg-[#EEF2FF]/40">
              <td className="px-6 py-4 text-[#64748B]">{formatShortDate(slot.date)}</td>
              <td className="px-6 py-4 font-medium tabular-nums">
                {formatTimeRange(slot.startTime, slot.endTime)}
              </td>
              <td className="px-6 py-4 text-[#64748B]">{slot.duration} min</td>
              <td className="px-6 py-4">
                <StatusBadge booked={slot.isBooked} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-[#E2E8F0] md:hidden">
        {slots.map((slot) => (
          <li key={slot.id} className="flex items-center justify-between gap-3 px-4 py-4">
            <div>
              <p className="text-xs text-[#64748B]">{formatShortDate(slot.date)}</p>
              <p className="mt-0.5 font-semibold tabular-nums">
                {formatTimeRange(slot.startTime, slot.endTime)}
              </p>
              <p className="mt-0.5 text-xs text-[#64748B]">{slot.duration} min</p>
            </div>
            <StatusBadge booked={slot.isBooked} />
          </li>
        ))}
      </ul>
    </>
  );
}
