// B"H
export const PHONE_QUERY = '(max-width: 720px), (pointer: coarse) and (max-width: 900px)';
export function isMobileDesktop(surface = document.documentElement) { return !!(globalThis.matchMedia?.(PHONE_QUERY).matches || surface?.clientWidth < 720); }
export function mobileClass(surface, enabled = isMobileDesktop(surface)) { surface?.classList?.toggle('desktop-mobile', enabled); surface?.classList?.toggle('desktop-desktop', !enabled); return enabled; }
export function mobileColumns(width) { return Math.max(2, Math.min(4, Math.floor((width || innerWidth) / 124))); }
/** B"H: mobile detection is a gate, not scattered guessing. */
