/**
 * B"H
 * @file SpiritualOverlayRuntime.js
 *
 * Chapter 39: The Hidden Letters Pressed Against The Air.
 *
 * The Awtsmoos lets perception become progression. This planner returns which
 * overlays are visible from refinement, niggun resonance, and debate state;
 * renderers may later turn these packets into glowing Hebrew and secret roads.
 */

export function planSpiritualOverlays(state = {}) {
  const overlays = [];
  if ((state.refinement || 0) >= 1) overlays.push('soft_hidden_glyphs');
  if ((state.refinement || 0) >= 3) overlays.push('concealed_paths');
  if (state.activeNiggun) overlays.push(`niggun_resonance_${state.activeNiggun}`);
  if (state.debateRevelation) overlays.push('debate_revelation_flash');
  return overlays;
}

export function canSeeOverlay(state, overlayId) {
  return planSpiritualOverlays(state).includes(overlayId);
}
