import { Button } from "../ui/Button";
import { formatLongDate, formatTimeRange } from "../../lib/format";
import type { Slot } from "../../types";

type Props = {
  slot: Slot;
  onBook: (slot: Slot) => void;
};

export function SlotRow({ slot, onBook }: Props) {
  const range = formatTimeRange(slot.startTime, slot.endTime);

  return (
      <li className="flex items-center justify-between gap-4 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3.5 transition-colors duration-150 hover:border-[#818CF8] hover:bg-[#EEF2FF]/40">
        <div>
          <p className="text-sm font-semibold tabular-nums">{range}</p>
          <p className="mt-0.5 text-xs text-[#64748B]">
            {slot.duration} min
          </p>
        </div>

        <Button
            size="sm"
            onClick={() => onBook(slot)}
            aria-label={`Book ${range} on ${formatLongDate(slot.date)}`}
            className="min-w-20"
        >
          Book
        </Button>
      </li>
  );
}