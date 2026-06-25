// B"H
/**
 * Quality is not one knob; it is a ladder of mercies.
 * Mobile breath can lower particles, sorting, atlas ambition, and debug work
 * independently while the mitzvah garden remains alive.
 */
export const RENDER_QUALITY = Object.freeze({
  low: { sort: false, maxSprites: 256, atlas: false, debug: false },
  medium: { sort: true, maxSprites: 768, atlas: false, debug: false },
  high: { sort: true, maxSprites: 2048, atlas: true, debug: true }
});

export function renderQuality(tier = "medium") {
  return RENDER_QUALITY[tier] || RENDER_QUALITY.medium;
}
