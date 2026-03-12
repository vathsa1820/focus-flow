/**
 * Safely parse a JSON string from localStorage.
 * Returns `fallback` on null, empty, or malformed input.
 */
export function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
