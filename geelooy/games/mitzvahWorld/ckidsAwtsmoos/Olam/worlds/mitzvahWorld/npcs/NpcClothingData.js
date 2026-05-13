
/**
 * B"H
 * @file NpcClothingData.js
 * @description
 * NPC clothing palette data.
 */

/**
 * B"H
 * Clothing presets for NPC visual variety.
 */
export const NPC_CLOTHING_PRESETS = Object.freeze([
  Object.freeze({
    name: "blue-jacket",
    shirt: 0x2457a6,
    pants: 0x111111,
    beard: 0x8a4b12,
    skin: 0xf0d19c
  }),

  Object.freeze({
    name: "green-coat",
    shirt: 0x1f6937,
    pants: 0x171717,
    beard: 0x5a2f0d,
    skin: 0xe8c48c
  }),

  Object.freeze({
    name: "brown-vest",
    shirt: 0x7c4b1d,
    pants: 0x101010,
    beard: 0xa45c16,
    skin: 0xf0c891
  }),

  Object.freeze({
    name: "white-shirt",
    shirt: 0xf2f2f2,
    pants: 0x0d0d0d,
    beard: 0x6b390e,
    skin: 0xe8c08a
  })
]);

/**
 * B"H
 * Gets deterministic clothing preset.
 *
 * @param {number} index
 * Index.
 *
 * @returns {Object}
 * Preset.
 */
export function getNpcClothingPreset(index = 0) {
  return NPC_CLOTHING_PRESETS[Math.abs(index) % NPC_CLOTHING_PRESETS.length];
}
