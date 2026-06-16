import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// ── Module-level singleton ────────────────────────────────────────────────────
// All hook instances share this single state so only ONE Supabase fetch runs,
// no matter how many components call useWishlist().

const getSessionId = (): string => {
  let id = sessionStorage.getItem("tvak_session");
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem("tvak_session", id);
  }
  return id;
};

const LS_KEY = "tvakshri_wishlist";

type Listener = (ids: string[]) => void;

let _wishlist: string[] = (() => {
  try {
    const stored = localStorage.getItem(LS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
})();
let _fetched = false;
let _fetching = false;
const _listeners = new Set<Listener>();

function _notify(ids: string[]) {
  _wishlist = ids;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ids));
  } catch {
    // localStorage may be unavailable in some contexts
  }
  _listeners.forEach((fn) => fn([...ids]));
}

/** Reset singleton — called on HMR / module re-evaluation */
function _reset() {
  _fetched = false;
  _fetching = false;
}

async function _fetchOnce() {
  if (_fetched || _fetching) return;
  _fetching = true;
  const sessionId = getSessionId();
  try {
    const { data, error } = await supabase
      .from("wishlist")
      .select("product_id")
      .eq("user_session", sessionId);

    if (!error && data) {
      _notify(data.map((row) => row.product_id));
    }
  } catch (err) {
    console.warn("Wishlist fetch failed:", err);
  } finally {
    _fetched = true;
    _fetching = false;
  }
}

// Support Vite HMR — reset fetch flag when module reloads in dev
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    _reset();
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<string[]>([..._wishlist]);
  const [loading, setLoading] = useState(!_fetched);
  const sessionId = useRef(getSessionId()).current;

  // Subscribe to module-level changes
  useEffect(() => {
    const listener: Listener = (ids) => {
      setWishlist(ids);
      setLoading(false);
    };
    _listeners.add(listener);

    // Trigger one global fetch (no-op if already done/in-progress)
    if (!_fetched) {
      setLoading(true);
      _fetchOnce().then(() => setLoading(false)).catch(() => setLoading(false));
    }

    return () => {
      _listeners.delete(listener);
    };
  }, []); // run once per component instance — safe, no deps needed

  const toggleWishlist = useCallback(async (productId: string) => {
    const isInList = _wishlist.includes(productId);

    // Optimistic update shared state immediately
    const optimisticList = isInList
      ? _wishlist.filter((id) => id !== productId)
      : [..._wishlist, productId];
    _notify(optimisticList);

    if (isInList) {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_session", sessionId)
        .eq("product_id", productId);
      if (error) {
        console.error("Wishlist remove error:", error.message);
        // revert — add it back
        _notify([..._wishlist, productId]);
      } else {
        toast.success("Removed from wishlist");
      }
    } else {
      const { error } = await supabase
        .from("wishlist")
        .insert({ user_session: sessionId, product_id: productId });
      if (error) {
        console.error("Wishlist add error:", error.message);
        if (!error.message.includes("duplicate")) {
          // revert — remove it
          _notify(_wishlist.filter((id) => id !== productId));
        }
        // On duplicate key, the item is already in DB — keep it in UI
      } else {
        toast.success("Added to wishlist");
      }
    }
  }, [sessionId]);

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  const removeFromWishlist = useCallback(
    (productId: string) => toggleWishlist(productId),
    [toggleWishlist]
  );

  return {
    wishlist,
    toggleWishlist,
    isWishlisted,
    removeFromWishlist,
    count: wishlist.length,
    loading,
  };
};
