import { useState, type FormEvent } from "react";
import { CalendarDays, CheckCircle2, Clock, Hourglass, Lightbulb } from "lucide-react";
import { Button } from "../ui/Button";
import { IconInput, IconSelect } from "../ui/Field";
import { createSlot } from "../../lib/slots-api";
import { getLocalDateString, getLocalTimeString } from "../../lib/format";

const DURATIONS = [15, 30, 45, 60, 90, 120];

type Props = {
  onCreated: () => Promise<void>;
  onViewSlots: () => void;
};

type Errors = { date?: string; time?: string; duration?: string };

function validate(date: string, time: string, duration: string): Errors {
  const errors: Errors = {};
  const today = getLocalDateString();

  if (!date) {
    errors.date = "Please choose a date.";
  } else if (date < today) {
    errors.date = "Please choose today or a future date.";
  }

  if (!time) {
    errors.time = "Please choose a start time.";
  } else if (date === today && time <= getLocalTimeString()) {
    errors.time = "That time has already passed today.";
  }

  if (!DURATIONS.includes(Number(duration))) {
    errors.duration = "Please choose a valid duration.";
  }

  return errors;
}

export function CreateSlotForm({ onCreated, onViewSlots }: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState("30");
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setServerError("");
    setSuccess("");

    const found = validate(date, time, duration);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);

    try {
      const result = await createSlot(date, time, Number(duration));

      if (!result.ok) {
        setServerError(result.message);
        return;
      }

      await onCreated();
      setSuccess("Your new time slot has been published!");
      setTime("10:00");
      setDuration("30");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
      <section
        aria-labelledby="create-slot-title"
        className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-8"
      >
        <h2 id="create-slot-title" className="text-2xl font-bold">
          Create a New Slot
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">
          Add a time slot for your availability.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          <IconInput
            id="new-slot-date"
            label="Date"
            icon={CalendarDays}
            type="date"
            required
            min={getLocalDateString()}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            error={errors.date}
          />

          <IconInput
            id="new-slot-time"
            label="Start Time"
            icon={Clock}
            type="time"
            required
            value={time}
            onChange={(event) => setTime(event.target.value)}
            error={errors.time}
          />

          <IconSelect
            id="new-slot-duration"
            label="Duration"
            icon={Hourglass}
            required
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            error={errors.duration}
          >
            {DURATIONS.map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes} minutes
              </option>
            ))}
          </IconSelect>

          {serverError && (
            <p
              role="alert"
              className="rounded-xl border border-[#DC2626]/20 bg-[#FEF2F2] p-3.5 text-sm text-[#DC2626]"
            >
              {serverError}
            </p>
          )}

          {success && (
            <div
              role="status"
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#ECFDF5] p-3.5 text-sm text-[#059669]"
            >
              <span className="flex items-center gap-2 font-medium">
                <CheckCircle2 size={17} aria-hidden="true" />
                {success}
              </span>
              <button
                type="button"
                onClick={onViewSlots}
                className="font-semibold underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059669]"
              >
                View your slots
              </button>
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={submitting}>
            {submitting ? "Adding slot..." : "Add Slot"}
          </Button>
        </form>
      </section>

      <aside className="rounded-2xl bg-[#EEF2FF] p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#4F46E5]">
          <Lightbulb size={20} aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-sm font-semibold">Tip</h3>
        <p className="mt-1 text-sm leading-6 text-[#64748B]">
          You can add multiple slots for different days and times. Each one
          appears on the booking page right away.
        </p>
      </aside>
    </div>
  );
}
