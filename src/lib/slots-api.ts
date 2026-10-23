import { supabase } from "../supabase";
import type { ApiResult, Slot } from "../types";
import { getEndDateTime, getLocalDateString, trimTime } from "./format";

/** Loads all upcoming slots (available and booked). */
export async function fetchSlots(): Promise<Slot[]> {
  const { data, error } = await supabase
    .from("slots")
    .select("id, date, start_time, duration_minutes, is_booked")
    .order("date")
    .order("start_time");

  if (error) throw error;

  const today = getLocalDateString();

  return (data ?? [])
    .map((slot) => {
      const startTime = trimTime(slot.start_time);

      const end = getEndDateTime(
          slot.date,
          startTime,
          slot.duration_minutes,
      );

      return {
        id: slot.id,
        date: slot.date,
        startTime,
        endTime: end.time,
        duration: slot.duration_minutes,
        isBooked: Boolean(slot.is_booked),
      } satisfies Slot;
    })
    .filter((slot) => slot.date >= today);
}

export async function bookSlot(
  slotId: number,
  name: string,
  email: string
): Promise<ApiResult> {
  try {
    const { error } = await supabase.rpc("create_booking", {
      p_slot_id: slotId,
      p_name: name,
      p_email: email,
    });

    if (!error) return { ok: true };

    console.error("Booking error:", error);
    const message = error.message.toLowerCase();

    if (message.includes("no longer available")) {
      return {
        ok: false,
        message: "This time was just booked. Please choose another slot.",
      };
    }
    if (message.includes("email")) {
      return { ok: false, message: "Please enter a valid email address." };
    }
    if (message.includes("name")) {
      return { ok: false, message: "Please enter your full name." };
    }

    return {
      ok: false,
      message: "We couldn't save your booking. Please try again.",
    };
  } catch (error) {
    console.error("Unexpected booking error:", error);
    return {
      ok: false,
      message:
        "Something went wrong. Please check your connection and try again.",
    };
  }
}

export async function createSlot(
  date: string,
  startTime: string,
  durationMinutes: number
): Promise<ApiResult> {
  try {
    const { error } = await supabase.rpc("create_slot", {
      p_date: date,
      p_start_time: startTime,
      p_duration_minutes: durationMinutes,
    });

    if (!error) return { ok: true };

    console.error("Create slot error:", error);

    if (error.code === "23505") {
      return {
        ok: false,
        message: "A slot already exists at this date and time.",
      };
    }

    if (error.code === "23P01") {
      return {
        ok: false,
        message:
            "This time overlaps with an existing slot. Please choose another time.",
      };
    }

    if (error.message.toLowerCase().includes("valid date")) {
      return { ok: false, message: "Please choose today or a future date." };
    }

    return {
      ok: false,
      message:
        "Could not create the slot. Please check the details and try again.",
    };
  } catch (error) {
    console.error("Unexpected create slot error:", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}
