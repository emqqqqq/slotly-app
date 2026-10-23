import type { Page } from "../types";
import { Logo } from "./Logo";

type Props = {
  page: Page;
  onNavigate: (page: Page) => void;
};

const items: { page: Page; label: string }[] = [
  { page: "book", label: "Book a Slot" },
  { page: "manage", label: "Manage Slots" },
];

export function Header({ page, onNavigate }: Props) {
  return (
    <header className="border-b border-[#E2E8F0] bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
        <div className="flex h-full items-center gap-6 sm:gap-10">
          <button
            type="button"
            onClick={() => onNavigate("book")}
            aria-label="Slotly home"
            className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4F46E5]"
          >
            <Logo />
          </button>

          <nav aria-label="Main" className="flex h-full items-stretch gap-4 sm:gap-6">
            {items.map((item) => {
              const active = page === item.page;

              return (
                <button
                  key={item.page}
                  type="button"
                  onClick={() => onNavigate(item.page)}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#4F46E5] ${
                    active ? "text-[#4F46E5]" : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#4F46E5]"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
