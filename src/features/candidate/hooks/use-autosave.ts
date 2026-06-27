"use client";

import { useEffect, useRef } from "react";

/**
 * Debounced auto-save. Calls `onSave` after `delay` ms of inactivity whenever
 * the serialized form value changes. Skips the initial mount so it never saves
 * unchanged data. `onSave` should be stable (wrap in useCallback).
 */
export function useAutosave(
  serialized: string,
  onSave: () => void,
  { delay = 1500, enabled = true }: { delay?: number; enabled?: boolean } = {},
) {
  const isFirst = useRef(true);

  useEffect(() => {
    if (!enabled) return;
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    const timer = setTimeout(onSave, delay);
    return () => clearTimeout(timer);
  }, [serialized, delay, enabled, onSave]);
}
