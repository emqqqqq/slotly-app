import { Check } from "lucide-react";

export function StatusBadge({ booked }: { booked: boolean }) {
  if (booked) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] px-2.5 py-1 text-xs font-semibold text-[#4F46E5]">
        <Check size={13} aria-hidden="true" />
        Booked
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-xs font-semibold text-[#059669]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" aria-hidden="true" />
      Available
    </span>
  );
}
