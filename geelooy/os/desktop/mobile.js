// B"H
export const PHONE_QUERY = '(max-width: 720px), (pointer: coarse) and (max-width: 900px)';
export function isMobileDesktop(surface = document.documentElement) {
  return !!(globalThis.matchMedia?.(PHONE_QUERY).matches || surface?.clientWidth < 720);
}
export function mobileClass(surface, enabled = isMobileDesktop(surface)) {
  surface?.classList?.toggle('desktop-mobile', enabled);
  surface?.classList?.toggle('desktop-desktop', !enabled);
  return enabled;
}
export function mobileColumns(width = innerWidth) {
  const w = Number(width || innerWidth);
  if (w <= 430) return 1;
  if (w <= 640) return 2;
  return Math.min(3, Math.max(2, Math.floor(w / 180)));
}
/** B"H: phone columns now obey the hand; narrow glass receives one clear path. */
