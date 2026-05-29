// B"H
/**
 * Geometry oracle for campaign enrichment.
 *
 * The Awtsmoos measures every chamber before adding cruelty. These pure helpers
 * choose anchors, sky bands, and trigger slots so added surprise is structured:
 * not guessed, not spammed, not impossible.
 */
export function enrichmentFrame(level, index) {
  const width = level.width || 2600;
  const anchor = Math.max(1320, Math.min(width - 1900, 1120 + index * 155));
  const skyY = -270 - (index % 5) * 22;
  return { width, anchor, skyY, far: anchor + 780 };
}

/** @param {object} level level clone @param {number} preferred x @returns {number|null} */
export function safeTriggerX(level, preferred) {
  const taken = (level.triggers || []).map(trigger => trigger.x).sort((a, b) => a - b);
  const min = 360;
  const max = Math.max(min, (level.width || 3000) - 260);
  const candidates = [];
  for (let offset = 0; offset < 3200; offset += 90) candidates.push(preferred + offset, preferred - offset);
  candidates.push(max, min, Math.floor((min + max) / 2));
  for (const raw of candidates) {
    const x = Math.max(min, Math.min(max, raw));
    if (taken.every(other => Math.abs(other - x) >= 250)) return x;
  }
  return null;
}

/** @param {object} a rect @param {object} b rect @returns {boolean} */
export function hit(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
