"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function usePolling<T>(fetcher: () => Promise<T>, intervalMs: number | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refresh = useCallback(async () => {
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
      setUpdatedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    if (!intervalMs) return;
    const id = setInterval(() => void refresh(), intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  return { data, error, loading, updatedAt, refresh };
}
