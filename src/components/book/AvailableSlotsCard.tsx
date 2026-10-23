import { AlertCircle, CalendarDays, LoaderCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { DateNavigator } from "../ui/DateNavigator";
import { SlotRow } from "./SlotRow";
import { formatShortDate, getLocalDateString } from "../../lib/format";
import type { Slot } from "../../types";

type Props = {
  slots: Slot[];
  loading: boolean;
  error: string;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onRetry: () => void;
  onBook: (slot: Slot) => void;
};

export function AvailableSlotsCard({
  slots,
  loading,
  error,
  selectedDate,
  onDateChange,
  onRetry,
  onBook,
}: Props) {
  const daySlots = slots.filter(
      (slot) => slot.date === selectedDate && !slot.isBooked
  );
  const nextDate = slots.find(
    (slot) => !slot.isBooked && slot.date > selectedDate
  )?.date;

  return (
    <section
      id="available-slots"
      aria-labelledby="available-slots-title"
      className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6"
    >
      <h2 id="available-slots-title" className="text-lg font-bold">
        Available Slots
      </h2>

      <div className="mt-4">
        <DateNavigator
          value={selectedDate}
          min={getLocalDateString()}
          onChange={onDateChange}
        />
      </div>

      <div className="mt-4" aria-live="polite">
        {loading && (
          <div className="flex min-h-56 flex-col items-center justify-center text-[#64748B]">
            <LoaderCircle
              size={28}
              className="animate-spin text-[#4F46E5]"
              aria-hidden="true"
            />
            <p className="mt-3 text-sm font-medium">
              Loading available times...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="flex min-h-56 flex-col items-center justify-center text-center">
            <AlertCircle size={28} className="text-[#DC2626]" aria-hidden="true" />
            <p className="mt-3 max-w-xs text-sm text-[#64748B]">{error}</p>
            <Button variant="secondary" size="sm" onClick={onRetry} className="mt-4">
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && daySlots.length === 0 && (
          <div className="flex min-h-56 flex-col items-center justify-center text-center">
            <CalendarDays size={30} className="text-[#818CF8]" aria-hidden="true" />
            <h3 className="mt-3 font-semibold">No times on this day</h3>
            <p className="mt-1 text-sm text-[#64748B]">
              {nextDate
                ? "Try another date, or jump to the next opening."
                : "The host hasn't published any upcoming times yet."}
            </p>
            {nextDate && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onDateChange(nextDate)}
                className="mt-4"
              >
                Go to {formatShortDate(nextDate)}
              </Button>
            )}
          </div>
        )}

        {!loading && !error && daySlots.length > 0 && (
          <ul className="max-h-[26rem] space-y-3 overflow-y-auto pr-1">
            {daySlots.map((slot) => (
              <SlotRow key={slot.id} slot={slot} onBook={onBook} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
