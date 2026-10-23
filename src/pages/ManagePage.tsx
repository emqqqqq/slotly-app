import { useState,useRef } from "react";
import { ArrowLeft, CalendarDays, Plus, X } from "lucide-react";
import { Button } from "../components/ui/Button";
import { CreateSlotForm } from "../components/manage/CreateSlotForm";
import { SlotsTable } from "../components/manage/SlotsTable";
import type { Slot } from "../types";
import HostGate from "../components/HostGate";

type Props = {
  slots: Slot[];
  loading: boolean;
  error: string;
  onRefresh: () => Promise<void>;
};

export function ManagePage({ slots, loading, error, onRefresh }: Props) {
  const [view, setView] = useState<"list" | "create">("list");
  const [filterDate, setFilterDate] = useState("");
  const filterDateRef = useRef<HTMLInputElement>(null);

  const visible = filterDate
    ? slots.filter((slot) => slot.date === filterDate)
    : slots;
  const availableCount = visible.filter((slot) => !slot.isBooked).length;
  const bookedCount = visible.length - availableCount;

  return (
      <HostGate>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-12">
          {view === "create" ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("list")}
                className="-ml-3 mb-6"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Back to your slots
              </Button>

              <CreateSlotForm
                onCreated={onRefresh}
                onViewSlots={() => setView("list")}
              />
            </>
          ) : (
            <>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Your Slots</h1>
                  <p className="mt-1 text-sm text-[#64748B]">
                    View and manage all your available time slots.
                  </p>
                </div>

                <Button onClick={() => setView("create")}>
                  <Plus size={17} aria-hidden="true" />
                  Add New Slot
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <label htmlFor="filter-date" className="mb-2 block text-sm font-semibold">
                    Filter by date
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <CalendarDays
                        size={18}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
                      />
                      <input
                          id="filter-date"
                          ref={filterDateRef}
                          type="date"
                          value={filterDate}
                          onChange={(event) => setFilterDate(event.target.value)}
                          onClick={() => {
                            try {
                              filterDateRef.current?.showPicker();
                            } catch {
                              //
                            }
                          }}
                          className="h-11 rounded-xl border border-[#E2E8F0] bg-white pl-11 pr-4 text-sm outline-none transition-colors duration-150 focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/15 [&::-webkit-calendar-picker-indicator]:hidden"
                      />
                    </div>

                    {filterDate && (
                      <Button variant="ghost" size="sm" onClick={() => setFilterDate("")}>
                        <X size={15} aria-hidden="true" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                {!loading && !error && visible.length > 0 && (
                  <p className="text-sm text-[#64748B]" aria-live="polite">
                    <span className="font-semibold text-[#059669]">{availableCount} available</span>
                    {" · "}
                    <span className="font-semibold text-[#4F46E5]">{bookedCount} booked</span>
                  </p>
                )}
              </div>

              <section
                aria-label="Your time slots"
                className="mt-4 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm"
              >
                <SlotsTable
                  slots={visible}
                  loading={loading}
                  error={error}
                  filtered={Boolean(filterDate)}
                  onRetry={() => void onRefresh()}
                  onAdd={() => setView("create")}
                />
              </section>
            </>
          )}
        </div>
      </HostGate>
  );
}
