// B"H
/**
 * @file waterConfig.js
 * @description Chapter 298: Water landmarks become named data: well, fountain,
 * sparkle, and future flow, so the entry square can keep expanding cleanly.
 */
export const WATER_FEATURES = Object.freeze({
  well: Object.freeze({ x: -18, z: -6 }),
  fountain: Object.freeze({ x: 18, z: -5 }),
  brook: Object.freeze({ id: 'entry_brook', points: [[-30, -11], [-12, -13], [6, -11], [28, -14]] })
});
