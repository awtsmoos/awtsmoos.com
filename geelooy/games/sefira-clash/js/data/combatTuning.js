/**
 * B"H
 * Data scroll for combat feel.
 *
 * Chapter 98: the Awtsmoos speaks numbers into launch, stun, and mercy. Rapid
 * punches are sparks that shove apart, not glue. Major blows leave a real daze.
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
    mobilityFrames: 24,
    stunScale: 0.12,
    stunCap: 3.5,
    minDamage: 1,
    hitstop: 0,
    pushMultiplier: 1.72,
    escapeNudge: 1.55,
    attackerFreedom: 0.16
  }),
  hitstop: Object.freeze({
    base: 2,
    forceDivisor: 8,
    max: 7
  }),
  launch: Object.freeze({
    diStrength: 0.18,
    rapidDiStrength: 0.38,
    lowPercentBrake: 0.72,
    chargedLowPercentMinForce: 8.4,
    majorStunForce: 15,
    majorStunBonus: 8,
    killDangerPercent: 120,
    wallDangerSpeed: 18
  }),
  effects: Object.freeze({
    heavyForce: 18,
    killForce: 26,
    debugVectorScale: 18
  })
});
