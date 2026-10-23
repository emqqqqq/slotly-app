import { useCallback, useEffect, useState } from "react";
import { fetchSlots } from "../lib/slots-api";
import type { Slot } from "../types";

export function useSlots() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setSlots(await fetchSlots());
      setError("");
    } catch (err) {
      console.error("Could not load slots:", err);
      setError(
        "We couldn't load available times. Please refresh the page and try again."
      );
    }
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await refresh();
      setLoading(false);
    }

    void load();
  }, [refresh]);

  return { slots, loading, error, refresh };
}
