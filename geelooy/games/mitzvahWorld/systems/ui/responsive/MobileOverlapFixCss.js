// B"H
export const MOBILE_OVERLAP_FIX_CSS = "./styles/mobile-ui-overlap-fix.css?v=mobile-overlap-joystick-20260617-bh1";
export function ensureMobileOverlapCss(doc = globalThis.document) {
  if (!doc || doc.querySelector('link[data-awtsmoos-mobile-overlap-fix]')) return false;
  const link = doc.createElement("link"); link.rel = "stylesheet"; link.href = MOBILE_OVERLAP_FIX_CSS; link.dataset.awtsmoosMobileOverlapFix = "true"; doc.head.appendChild(link); return true;
}
export default ensureMobileOverlapCss;
