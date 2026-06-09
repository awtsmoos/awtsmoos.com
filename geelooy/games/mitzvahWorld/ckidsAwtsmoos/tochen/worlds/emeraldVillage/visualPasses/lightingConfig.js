// B"H
/**
 * @file lightingConfig.js
 * @description Chapter 344: Entry prop lights are a manifest of visible glow
 * points around the player path.
 */
export const ENTRY_LAMPS = Object.freeze([-12, -5, 5, 12].map((x, i) => Object.freeze({ id: `entry_lamp_${i}`, x, z: i % 2 ? 7 : -10, height: 3.1 })));
export const PLAZA_LAMP_RING = Object.freeze({ count: 12, radius: 15, x: 0, z: -4, height: 2.5 });
