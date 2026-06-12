/**
 * B"H
 * Impact tier oracle.
 *
 * Chapter 5: the Awtsmoos has no body and no form, yet every created collision
 * receives a garment. A small spark whispers, a heavy strike opens bronze, a
 * launch tears a white seam through the air, and a mythic blow makes the arena
 * remember that it is being recreated from nothing this very instant.
 */
export const IMPACT_TIERS = Object.freeze({
  tiny: { name: 'tiny', flash: 0.04, shake: 0.5, ring: 0, streak: 0, tint: 0.02 },
  clean: { name: 'clean', flash: 0.08, shake: 1.2, ring: 32, streak: 0.2, tint: 0.04 },
  heavy: { name: 'heavy', flash: 0.16, shake: 3.1, ring: 74, streak: 0.45, tint: 0.08 },
  launch: { name: 'launch', flash: 0.25, shake: 5.2, ring: 118, streak: 0.75, tint: 0.13 },
  mythic: { name: 'mythic', flash: 0.38, shake: 8.5, ring: 172, streak: 1, tint: 0.2 }
});

/**
 * Names the visible violence of one event without changing gameplay.
 *
 * @param {object} event Combat/stage event from the existing event stream.
 * @returns {object} Frozen tier profile used by camera, flash, and overlays.
 */
export function impactTier(event) {
  if (!event || event.type !== 'hit') return IMPACT_TIERS.clean;
  const force = event.force || event.damage || 0;
  if (event.koDanger || event.fullCharge || force >= 58) return IMPACT_TIERS.mythic;
  if (force >= 44 || event.shockwave) return IMPACT_TIERS.launch;
  if (force >= 28 || event.charge > 0.45) return IMPACT_TIERS.heavy;
  if (event.rapid || force < 10) return IMPACT_TIERS.tiny;
  return IMPACT_TIERS.clean;
}
