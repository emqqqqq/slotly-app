import { CalendarDays, ShieldCheck, Zap, type LucideIcon } from "lucide-react";

const features: { icon: LucideIcon; lines: [string, string] }[] = [
  { icon: CalendarDays, lines: ["Flexible", "scheduling"] },
  { icon: Zap, lines: ["Instant", "confirmation"] },
  { icon: ShieldCheck, lines: ["No account", "needed"] },
];

export function Hero() {
  return (
    <div>
      <span className="inline-block rounded-full bg-[#EEF2FF] px-3 py-1.5 text-xs font-semibold text-[#4F46E5]">
        Easy • Fast • Simple
      </span>

      <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#0F172A] sm:text-5xl">
        Book your
        <br />
        preferred time
      </h1>

      <p className="mt-5 max-w-md text-lg leading-8 text-[#64748B]">
        Choose a time slot that works for you. Quick, simple, no signup
        required.
      </p>

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {features.map(({ icon: Icon, lines }) => (
          <li key={lines[0]} className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5]">
              <Icon size={19} aria-hidden="true" />
            </span>
            <span className="text-xs leading-5 text-[#64748B]">
              {lines[0]}
              <br />
              {lines[1]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
