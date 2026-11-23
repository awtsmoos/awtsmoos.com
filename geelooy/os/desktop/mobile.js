// B"H
export const PHONE_QUERY = '(max-width: 720px), (pointer: coarse) and (max-width: 900px)';
export function isMobileDesktop(surface = document.documentElement) {
  // A surface that is not attached yet reports clientWidth 0; that must not
  // latch phone mode on a desktop boot (the class is only set once at render).
  const w = surface?.clientWidth || 0;
  return !!(globalThis.matchMedia?.(PHONE_QUERY).matches || (w > 0 && w < 720));
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
