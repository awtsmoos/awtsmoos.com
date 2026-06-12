/**
 * B"H
 * Spectacle state vessel.
 *
 * Chapter 6: the Awtsmoos renews the world without noise, but the brawl is
 * allowed to thunder. This module keeps only temporary visual pressure: flash,
 * shake, tint, rings, streaks, and afterimages. It owns no damage, no victory,
 * no AI decision. It is the garment of impact, not the impact itself.
 */
export function createSpectacleState() {
  return { flash: 0, tint: 0, shake: 0, zoomKick: 0, rings: [], streaks: [], afterimages: [] };
}

/**
 * Ensures the match has a spectacle ledger.
 *
 * @param {object} state Live game state.
 * @returns {object} The spectacle state attached to the match.
 */
export function ensureSpectacle(state) {
  state.spectacle ||= createSpectacleState();
  state.spectacle.rings ||= [];
  state.spectacle.streaks ||= [];
  state.spectacle.afterimages ||= [];
  return state.spectacle;
}

/**
 * Decays visual pressure once per gameplay frame.
 *
 * @param {object} state Live game state.
 */
export function stepSpectacleState(state) {
  const s = ensureSpectacle(state);
  s.flash *= 0.82;
  s.tint *= 0.9;
  s.shake *= 0.84;
  s.zoomKick *= 0.86;
  s.rings = stepList(s.rings, 1);
  s.streaks = stepList(s.streaks, 1);
  s.afterimages = stepList(s.afterimages, 1);
}

/**
 * Adds a screen and camera impulse.
 *
 * @param {object} state Live game state.
 * @param {object} tier Impact tier profile.
 */
export function addSpectacleImpulse(state, tier) {
  const s = ensureSpectacle(state);
  s.flash = Math.max(s.flash, tier.flash || 0);
  s.tint = Math.max(s.tint, tier.tint || 0);
  s.shake = Math.max(s.shake, tier.shake || 0);
  s.zoomKick = Math.max(s.zoomKick, Math.min(0.055, (tier.shake || 0) * 0.005));
}

function stepList(items, drain) {
  const out = [];
  for (const item of items) {
    const next = { ...item, life: item.life - drain };
    if (next.life > 0) out.push(next);
  }
  return out;
}
