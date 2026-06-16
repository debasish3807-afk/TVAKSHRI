/**
 * useRecentlyViewed — tracks the last 8 product IDs the user has viewed.
 * Persisted in localStorage, no server required.
 */
import { useState, useCallback, useEffect } from "react";

const LS_KEY = "tvak_recently_viewed";
const MAX_ITEMS = 8;

function loadIds(): string[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveIds(ids: string[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ids));
  } catch { /* quota */ }
}

// Module-level so all instances share the same list
let _ids: string[] = loadIds();
type Listener = (ids: string[]) => void;
const _listeners = new Set<Listener>();

function _notify(ids: string[]) {
  _ids = ids;
  saveIds(ids);
  _listeners.forEach((fn) => fn([...ids]));
}

export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>([..._ids]);

  useEffect(() => {
    const listener: Listener = (updated) => setIds(updated);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);

  const recordView = useCallback((productId: string) => {
    const next = [productId, ..._ids.filter((id) => id !== productId)].slice(0, MAX_ITEMS);
    _notify(next);
  }, []);

  const clearHistory = useCallback(() => {
    _notify([]);
  }, []);

  return { ids, recordView, clearHistory };
}
