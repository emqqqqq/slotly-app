import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { CalendarDays, CheckCircle2, Lock, Mail, UserRound, X } from "lucide-react";
import { Button } from "../ui/Button";
import { IconInput } from "../ui/Field";
import { bookSlot } from "../../lib/slots-api";
import { formatLongDate, formatTimeRange } from "../../lib/format";
import type { Slot } from "../../types";
import { supabase } from "../../supabase";

type Props = {
  slot: Slot;
  onClose: () => void;
  onRefresh: () => Promise<void>;
};

type FieldErrors = { name?: string; email?: string };

const AI_TIMEOUT_MS = 10000;

function validate(name: string, email: string): FieldErrors {
  const errors: FieldErrors = {};

  if (name.trim().length < 2) {
    errors.name = "Please enter your full name.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  return errors;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        }
    );
  });
}

function MessageSkeleton() {
  return (
      <div className="space-y-2 pt-1">
        <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .skeleton-line {
          background: linear-gradient(
            90deg,
            rgba(5, 150, 105, 0.18) 25%,
            rgba(5, 150, 105, 0.5) 50%,
            rgba(5, 150, 105, 0.18) 75%
          );
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.4s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .skeleton-line {
            animation: none;
            background: rgba(5, 150, 105, 0.3);
          }
        }
      `}</style>
        <div className="skeleton-line h-3.5 w-full rounded" />
        <div className="skeleton-line h-3.5 w-11/12 rounded" />
        <div className="skeleton-line h-3.5 w-2/3 rounded" />
      </div>
  );
}

function FadeInText({ text }: { text: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
      <p
          className={`text-sm leading-6 transition-opacity duration-500 motion-reduce:transition-none ${
              shown ? "opacity-100" : "opacity-0"
          }`}
      >
        {text}
      </p>
  );
}

export function BookingModal({ slot, onClose, onRefresh }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  function requestClose() {
    if (!submitting) onClose();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      requestClose();
      return;
    }

    if (event.key !== "Tab" || !dialogRef.current) return;

    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input:not([disabled])"
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  async function loadAiMessage(bookedName: string) {
    try {
      const { data, error } = await withTimeout(
          supabase.functions.invoke("generate-confirmation", {
            body: {
              name: bookedName,
              date: slot.date,
              startTime: slot.startTime,
              durationMinutes: slot.duration,
            },
          }),
          AI_TIMEOUT_MS
      );

      if (error) {
        console.error("Error by Edge function:", error);
      } else if (data?.message) {
        if (mountedRef.current) setAiMessage(String(data.message).trim());
      } else {
        console.warn("The function returned data, but no attribute 'message':", data);
      }
    } catch (aiError) {
      console.error("The AI message was not generated:", aiError);
    } finally {
      if (mountedRef.current) setAiLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const errors = validate(name, email);
    setFieldErrors(errors);
    setServerError("");

    if (errors.name || errors.email) return;

    setSubmitting(true);

    try {
      const result = await bookSlot(slot.id, name.trim(), email.trim());

      if (!result.ok) {
        console.error("bookSlot failed:", result.message);
        setServerError(result.message);
        await onRefresh();
        return;
      }

      setSuccess(true);
      setAiLoading(true);
      void loadAiMessage(name.trim());

      await onRefresh().catch((refreshError) =>
          console.error("Failed to refresh time slots:", refreshError)
      );
    } finally {
      setSubmitting(false);
    }
  }

  const fallbackMessage = `Thanks, ${name.trim()}! Your appointment on ${formatLongDate(
      slot.date
  )} at ${formatTimeRange(slot.startTime, slot.endTime)} is confirmed.`;

  return (
      <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm"
          onKeyDown={handleKeyDown}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) requestClose();
          }}
      >
        <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            className="my-auto w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
            <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    success ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#EEF2FF] text-[#4F46E5]"
                }`}
            >
              {success ? (
                  <CheckCircle2 size={22} aria-hidden="true" />
              ) : (
                  <CalendarDays size={22} aria-hidden="true" />
              )}
            </span>
              <h2 id="booking-title" className="text-xl font-bold">
                {success ? "You're booked!" : "Book a Slot"}
              </h2>
            </div>

            {!submitting && (
                <button
                    type="button"
                    onClick={requestClose}
                    aria-label="Close booking window"
                    className="rounded-lg p-2 text-[#64748B] transition-colors duration-150 hover:bg-[#F8FAFC] hover:text-[#0F172A] focus-visible:outline-2 focus-visible:outline-[#4F46E5]"
                >
                  <X size={20} aria-hidden="true" />
                </button>
            )}
          </div>

          <div className="mt-5 rounded-xl bg-[#EEF2FF] p-4">
            <p className="text-sm font-medium text-[#0F172A]">{formatLongDate(slot.date)}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[#0F172A]">
              {formatTimeRange(slot.startTime, slot.endTime)}
            </p>
            <p className="mt-1 text-sm text-[#64748B]">{slot.duration} minutes</p>
          </div>

          {success ? (
              <div className="mt-5">
                <div className="flex items-start gap-3 rounded-xl bg-[#ECFDF5] p-4 text-[#059669]">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">Booking confirmed</p>
                    <div className="mt-1 min-h-[4.5rem]" aria-live="polite">
                      {aiLoading ? (
                          <>
                            <MessageSkeleton />
                          </>
                      ) : (
                          <FadeInText text={aiMessage || fallbackMessage} />
                      )}
                    </div>
                  </div>
                </div>

                <Button onClick={onClose} fullWidth size="lg" className="mt-5" autoFocus>
                  Done
                </Button>
              </div>
          ) : (
              <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
                <IconInput
                    id="booking-name"
                    name="name"
                    label="Full Name"
                    icon={UserRound}
                    type="text"
                    autoComplete="name"
                    autoFocus
                    required
                    maxLength={100}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Jane Doe"
                    disabled={submitting}
                    error={fieldErrors.name}
                />

                <IconInput
                    id="booking-email"
                    name="email"
                    label="Email"
                    icon={Mail}
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="jane.doe@example.com"
                    disabled={submitting}
                    error={fieldErrors.email}
                />

                {serverError && (
                    <p
                        role="alert"
                        className="rounded-xl border border-[#DC2626]/20 bg-[#FEF2F2] p-3.5 text-sm text-[#DC2626]"
                    >
                      {serverError}
                    </p>
                )}

                <Button type="submit" fullWidth size="lg" loading={submitting}>
                  {submitting ? "Saving booking..." : "Confirm Booking"}
                </Button>

                <p className="flex items-center justify-center gap-1.5 text-xs text-[#64748B]">
                  <Lock size={13} aria-hidden="true" />
                  Your booking is confirmed once it&apos;s successfully saved.
                </p>
              </form>
          )}
        </div>
      </div>
  );
}
