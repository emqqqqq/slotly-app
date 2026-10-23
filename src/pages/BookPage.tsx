import { useState } from "react";
import { Hero } from "../components/book/Hero";
import { AvailableSlotsCard } from "../components/book/AvailableSlotsCard";
import { BookingModal } from "../components/book/BookingModal";
import { getLocalDateString } from "../lib/format";
import type { Slot } from "../types";

type Props = {
  slots: Slot[];
  loading: boolean;
  error: string;
  onRefresh: () => Promise<void>;
};

export function BookPage({ slots, loading, error, onRefresh }: Props) {
  const [selectedDate, setSelectedDate] = useState(getLocalDateString);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const effectiveDate = selectedDate ?? slots.find((slot) => !slot.isBooked)?.date ?? getLocalDateString()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_28rem] lg:gap-16">
        <div className="lg:pt-10">
          <Hero />
        </div>

        <AvailableSlotsCard
          slots={slots}
          loading={loading}
          error={error}
          selectedDate={effectiveDate}
          onDateChange={setSelectedDate}
          onRetry={() => void onRefresh()}
          onBook={setSelectedSlot}
        />
      </div>

      {selectedSlot && (
        <BookingModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}
