
// B"H

/**
 * @file GaitProfileTable.js
 * @description
 * ============================================================================
 * CHAPTER: THE TABLE OF WALKS
 * ============================================================================
 *
 * Every gait is data.
 * Calm. Warm. Thoughtful. Furious. Melancholic. Euphoric.
 * Each one is a little cartoon-realist spell for limbs.
 *
 * @constant {Object} GaitProfileTable
 */
export const GaitProfileTable = {
  calm: {
    speed: 0.0048,
    strideLength: 44,
    bounceAmp: 7,
    footLift: 11,
    armSwing: 30,
    elbowBend: 18,
    torsoSway: 3.5,
    torsoLean: 1.2
  },

  warm: {
    speed: 0.0049,
    strideLength: 42,
    bounceAmp: 8,
    footLift: 10,
    armSwing: 28,
    elbowBend: 20,
    torsoSway: 4.0,
    torsoLean: 1.6
  },

  thoughtful: {
    speed: 0.0041,
    strideLength: 38,
    bounceAmp: 5,
    footLift: 8,
    armSwing: 22,
    elbowBend: 22,
    torsoSway: 2.0,
    torsoLean: 0.8
  },

  furious: {
    speed: 0.0078,
    strideLength: 58,
    bounceAmp: 5,
    footLift: 8,
    armSwing: 38,
    elbowBend: 16,
    torsoSway: 2.4,
    torsoLean: 3.0
  },

  melancholic: {
    speed: 0.0034,
    strideLength: 32,
    bounceAmp: 3,
    footLift: 5,
    armSwing: 15,
    elbowBend: 26,
    torsoSway: 1.5,
    torsoLean: 0.5
  },

  euphoric: {
    speed: 0.0061,
    strideLength: 52,
    bounceAmp: 14,
    footLift: 17,
    armSwing: 40,
    elbowBend: 20,
    torsoSway: 5.4,
    torsoLean: 2.2
  },

  cartoonHero: {
    speed: 0.0067,
    strideLength: 60,
    bounceAmp: 16,
    footLift: 22,
    armSwing: 48,
    elbowBend: 18,
    torsoSway: 6.2,
    torsoLean: 2.8
  }
};
