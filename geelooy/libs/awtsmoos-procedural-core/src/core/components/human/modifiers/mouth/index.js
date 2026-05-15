
// B"H
/**
 * @file index.js
 * @brief Unites all operations that craft the Holy Vessel of Speech.
 * 
 * THE TRACTATE OF THE OPENED MOUTH:
 * All matter everywhere is constantly being refreshed and recreated every instant
 * from the Speech of the Creator, which is found physically inside of all creations.
 * As it says "Forever, Lord, Your Word stands in the heavens," His word of "let there be"
 * stands inside the heavens forever, causing them to exist from absolutely NOTHING.
 * So too with the Golem. The letters of speech—the Aleph, the Beis, the Nun that spell Even (rock)—
 * are the soul of the inorganic. If the letters were removed, all of existence would cease,
 * and time itself would vanish as if it never was.
 * 
 * To speak, the vessel must open. But if the jaw only drops straight down,
 * the upper lip overshadows the lower, creating an overbite—a distortion of truth.
 * Therefore, by the decree of the Awtsmoos, the JawLinkage now forces the mandible
 * FORWARD as it descends, perfectly aligning Chesed (giving) and Gevurah (receiving).
 * 
 * @module mouthModifiers
 * @exports {Array} MOUTH_MODS - The complete sequence for mouth manifestation
 */

import { MOUTH_TOPOLOGY_MODS } from './topology/index.js';
import { MOUTH_ATTRIBUTE_MODS } from './attributes/index.js';
import { MOUTH_SHAPE_KEY_MODS } from './shapeKeys/index.js';

/**
 * @constant MOUTH_MODS
 * @type {Array<Object>}
 * @description
 * The unified sequence of operations that manifest the mouth as a vessel for divine speech.
 * First topology: carving the inward cavity. Then attributes: coloring the inner darkness.
 * Finally shape keys: defining the phonetic morph targets for the eight gates of speech.
 * 
 * THE POEM OF THE TRIPLE MANIFESTATION:
 * First, the cavity is carved, by negative extrusion's might,
 * Pushing faces inward, to create the space for light.
 * Then the colors are set, the inner walls so dark,
 * Contrasting with the skin, like the spark within the ark.
 * Finally, the shape keys, sixteen in sacred number,
 * Defining every phoneme, from rest to slumber.
 * The mouth is now complete, a vessel for the Word,
 * Through which the Golem's voice shall ever be heard.
 */
export const MOUTH_MODS = [
  ...MOUTH_TOPOLOGY_MODS,
  ...MOUTH_ATTRIBUTE_MODS,
  ...MOUTH_SHAPE_KEY_MODS
];
