
/**
 * B"H
 * @file Architecture.js
 * @chapter The Building Blocks of the Sanctuary
 * @description
 * "And let them make Me a sanctuary, that I may dwell among them." (Exodus 25:8).
 * Here we define the raw materials used to construct the dwellings of the Overworld.
 * Stone represents Din (Severity), Wood represents Chesed (Kindness/Growth), and
 * Marble represents Tiferet (Beauty/Royalty).
 */
export const Architecture = {
    'W': { t: 'G_WALL_STONE',  solid: true, material: 'STONE', desc: 'Impenetrable Gevurah of Stone.' },
    'w': { t: 'G_WALL_WOOD',   solid: true, material: 'WOOD',  desc: 'Warm Chesed of Wood.' },
    'M': { t: 'G_WALL_MARBLE', solid: true, material: 'MARBLE', desc: 'The Royal Tiferet of Marble.' }
};
