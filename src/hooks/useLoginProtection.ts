/**
 * useLoginProtection — client-side brute-force protection.
 * Tracks failed login attempts per email in sessionStorage.
 * After MAX_ATTEMPTS failures within WINDOW_MS, blocks login for LOCKOUT_MS.
 */

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const WINDOW_MS = 10 * 60 * 1000;  // 10-minute window

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

function getKey(email: string) {
  return `tvak_login_attempts_${email.toLowerCase().trim()}`;
}

function getRecord(email: string): AttemptRecord {
  try {
    const raw = sessionStorage.getItem(getKey(email));
    if (!raw) return { count: 0, firstAttempt: Date.now() };
    const rec = JSON.parse(raw) as AttemptRecord;
    // Reset if outside window and not locked
    if (!rec.lockedUntil && Date.now() - rec.firstAttempt > WINDOW_MS) {
      return { count: 0, firstAttempt: Date.now() };
    }
    return rec;
  } catch {
    return { count: 0, firstAttempt: Date.now() };
  }
}

function saveRecord(email: string, rec: AttemptRecord) {
  try {
    sessionStorage.setItem(getKey(email), JSON.stringify(rec));
  } catch { /* ignore */ }
}

export function useLoginProtection() {
  /**
   * Call before attempting login.
   * Returns { blocked: true, secondsLeft } if locked out, or { blocked: false } if OK.
   */
  const checkBlocked = (email: string): { blocked: boolean; secondsLeft?: number } => {
    if (!email.trim()) return { blocked: false };
    const rec = getRecord(email);
    if (rec.lockedUntil) {
      const remaining = rec.lockedUntil - Date.now();
      if (remaining > 0) {
        return { blocked: true, secondsLeft: Math.ceil(remaining / 1000) };
      }
      // Lockout expired — clear record
      saveRecord(email, { count: 0, firstAttempt: Date.now() });
    }
    return { blocked: false };
  };

  /**
   * Call after a FAILED login attempt.
   * Returns { locked: true, secondsLeft } if now locked, or { locked: false }.
   */
  const recordFailure = (email: string): { locked: boolean; secondsLeft?: number; attemptsLeft?: number } => {
    if (!email.trim()) return { locked: false };
    const rec = getRecord(email);
    const now = Date.now();
    const newCount = rec.count + 1;

    if (newCount >= MAX_ATTEMPTS) {
      const lockedUntil = now + LOCKOUT_MS;
      saveRecord(email, { count: newCount, firstAttempt: rec.firstAttempt, lockedUntil });
      return { locked: true, secondsLeft: Math.ceil(LOCKOUT_MS / 1000) };
    }

    saveRecord(email, { count: newCount, firstAttempt: rec.firstAttempt || now });
    return { locked: false, attemptsLeft: MAX_ATTEMPTS - newCount };
  };

  /**
   * Call after a SUCCESSFUL login to clear the record.
   */
  const recordSuccess = (email: string) => {
    if (!email.trim()) return;
    try { sessionStorage.removeItem(getKey(email)); } catch { /* ignore */ }
  };

  return { checkBlocked, recordFailure, recordSuccess };
}
