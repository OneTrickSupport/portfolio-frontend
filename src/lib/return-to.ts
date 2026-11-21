// Remembers where a visitor was when they were asked to sign in, so the sign-in
// pages can send them back there. sessionStorage survives the Google redirect.

const KEY = "returnTo";

export function rememberReturnTo(path: string) {
  try {
    if (path.startsWith("/") && !path.startsWith("//")) sessionStorage.setItem(KEY, path);
  } catch {
    // storage unavailable: sign-in falls back to its default page
  }
}

/** The remembered path (only ever a path inside this site), cleared once read. */
export function takeReturnTo(fallback: string): string {
  try {
    const path = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (path && path.startsWith("/") && !path.startsWith("//")) return path;
  } catch {
    // fall through
  }
  return fallback;
}
