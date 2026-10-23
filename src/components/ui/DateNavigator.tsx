import { useRef } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, formatShortDate } from "../../lib/format";

type Props = {
  value: string;
  min?: string;
  onChange: (date: string) => void;
};

const iconButton =
  "flex h-full w-11 items-center justify-center text-[#64748B] transition-colors duration-150 hover:bg-[#EEF2FF] hover:text-[#4F46E5] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#64748B]";

export function DateNavigator({ value, min, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const atMin = min !== undefined && value <= min;

  function openPicker() {
    const input = inputRef.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {
        //
      }
    }

    input.focus();
    input.click();
  }

  return (
    <div className="relative flex h-12 items-stretch overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
      <button
        type="button"
        onClick={openPicker}
        aria-label={`Selected date ${formatShortDate(value)}. Change date`}
        className="flex flex-1 items-center gap-3 px-4 text-left text-sm font-semibold text-[#0F172A] transition-colors duration-150 hover:bg-[#EEF2FF]/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#4F46E5]"
      >
        <CalendarDays size={18} className="text-[#4F46E5]" aria-hidden="true" />
        {formatShortDate(value)}
      </button>

      <input
        ref={inputRef}
        type="date"
        value={value}
        min={min}
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          if (event.target.value) onChange(event.target.value);
        }}
        className="pointer-events-none absolute bottom-0 left-0 h-px w-full opacity-0"
      />

      <button
        type="button"
        onClick={() => onChange(addDays(value, -1))}
        disabled={atMin}
        aria-label="Previous day"
        className={`${iconButton} border-l border-[#E2E8F0]`}
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={() => onChange(addDays(value, 1))}
        aria-label="Next day"
        className={`${iconButton} border-l border-[#E2E8F0]`}
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
