
/**
 * B"H
 * @file Terrain.js
 * @chapter The Dust of the Earth
 * @description
 * "Let the waters under the heaven be gathered to one place, and let the dry land appear."
 * From the primordial 'Tohu', various terrains emerged to challenge and elevate the Tzaddik.
 * Snow represents frozen water, strict Din (Judgment) that must be melted by the fire of Torah.
 * Mountains represent the arduous climb towards higher consciousness.
 */
export const Terrain = {
    '1': { t: 'G_GRASS_FLAT', solid: false, desc: 'Soft spiritual grass.' },
    '2': { t: 'G_DIRT_PATH',  solid: false, desc: 'A path cleared for the righteous.' },
    '.': { t: 'G_SAND',       solid: false, desc: 'The shifting sands of time.' },
    '~': { t: 'G_WATER',      solid: true,  desc: 'The deep waters of Binah. Impassable.' },
    '*': { t: 'G_SNOW',       solid: false, desc: 'Frozen judgment. Cold and pure.' },
    '^': { t: 'G_MOUNTAIN',   solid: true,  desc: 'Elevated earth. Hard to traverse.' }
};
