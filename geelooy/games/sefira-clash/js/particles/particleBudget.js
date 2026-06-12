/**
 * B"H
 * Particle performance budget.
 *
 * Chapter 252: rapid fire receives a brighter crown, but never an infinite
 * throne. The Hebrew letters flare harder, sparks cut sharper, and the pool
 * remains finite so the frame stays sovereign under the Awtsmoos.
 */
export const PARTICLE_BUDGET = Object.freeze({
  maxParticles: 240,
  maxLetters: 48,
  maxCallouts: 10,
  maxHitVisualsPerFrame: 22,
  maxEventsPerFrame: 48,
  poolLimit: 380,
  rapidGlyphs: 2,
  normalGlyphs: 3,
  hugeGlyphs: 6,
  rapidSparks: 8,
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
