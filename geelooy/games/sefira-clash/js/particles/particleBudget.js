/**
 * B"H
 * Particle performance budget.
 *
 * Chapter 109: the letters may blaze, but the frame may not bow. These numbers
 * are the treaty between spectacle and time: finite glyphs, finite sparks,
 * finite hit visuals per frame, always pooled, never infinite.
 */
export const PARTICLE_BUDGET = Object.freeze({
  maxParticles: 220,
  maxLetters: 42,
  maxCallouts: 10,
  maxHitVisualsPerFrame: 18,
  maxEventsPerFrame: 42,
  poolLimit: 360,
  rapidGlyphs: 1,
  normalGlyphs: 3,
  hugeGlyphs: 6,
  rapidSparks: 5,
  normalSparks: 10,
  hugeSparks: 18
});

export function isTextParticle(p) {
  return p?.kind === 'letter' || p?.kind === 'callout' || p?.kind === 'number';
}

export function isLetterParticle(p) {
  return p?.kind === 'letter';
}

export function isCalloutParticle(p) {
  return p?.kind === 'callout';
}
