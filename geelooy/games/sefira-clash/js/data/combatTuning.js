/**
 * B"H
 * Data scroll for combat feel.
 *
 * Chapter 1: in the arena of sparks, the Awtsmoos speaks numbers into law.
 * These constants are small, readable vessels: no hidden magic, no heavy GPU
 * prayer, only fast browser math that lets every punch tell the truth.
 */
export const COMBAT_TUNING = Object.freeze({
  combo: Object.freeze({
    attackerWindow: 95,
    defenderWindow: 115,
    announcementSteps: Object.freeze([3, 5, 10, 20, 35]),
    scoreBase: 10,
    scorePerDamage: 3,
    escapeStaleAfter: 9,
    escapeDecayFrames: 42
  }),
  rapid: Object.freeze({
    mobilityFrames: 18,
    stunScale: 0.26,
    stunCap: 13,
    minDamage: 1,
    hitstop: 0
  }),
  hitstop: Object.freeze({
    base: 2,
    forceDivisor: 8,
    max: 7
  }),
  launch: Object.freeze({
    diStrength: 0.18,
    rapidDiStrength: 0.28,
    lowPercentBrake: 0.62,
    killDangerPercent: 120,
    wallDangerSpeed: 18
  }),
  effects: Object.freeze({
    heavyForce: 18,
    killForce: 26,
    debugVectorScale: 18
  })
});
