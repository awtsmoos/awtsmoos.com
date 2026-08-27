// B"H

import { UPGRADES } from './upgrades.js';
import { CONSUMABLES } from './consumables.js';
import { PROBABILITIES } from './probabilities.js';
import { SONGS } from './songs.js';

/**
 * The Master List of all vessels, lights, and powers available to the soul (player).
 * It unifies the static upgrades, the temporary consumables, the probabilistic interventions,
 * and the holy melodies.
 */
export const POWER_UPS = [
    ...UPGRADES,
    ...CONSUMABLES,
    ...PROBABILITIES,
    ...SONGS
];