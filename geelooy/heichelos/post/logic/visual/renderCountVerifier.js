// B"H
/** Chapter 304: Count the verses that actually arrived. */
export function verifyRenderedSectionCount({ expected = null } = {}) {
  const sections = document.querySelectorAll('#realPost .section').length;
  const chunks = document.querySelectorAll('#virtual-scroll-container > .scroll-chunk').length;
  const known = Number.isFinite(expected) ? expected : (window.__awtsmoosVirtualSections?.length || null);
  const ok = known == null || sections >= known || chunks >= known;
  const report = { ok, expected: known, sections, chunks };
  window.__awtsmoosRenderCountReport = report;
  if (!ok) console.warn('B"H render count mismatch', report);
  return report;
}
