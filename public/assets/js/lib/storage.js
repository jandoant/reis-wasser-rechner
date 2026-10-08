/**
 * Thin, fail-safe wrapper around localStorage (private mode, blocked storage, …).
 */

export function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — app keeps working in memory */
  }
}
