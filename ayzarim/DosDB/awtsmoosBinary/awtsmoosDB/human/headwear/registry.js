
/**
 * @file registry.js
 * @description
 * Just as the Awtsmoos contains the roots of all possible creations in His Wisdom,
 * this Registry contains the archetypal forms of all Headwear.
 *
 * We use a Map to avoid the 'Switch-Statement' of exile, allowing for 
 * O(1) manifestation of any hat based on its true Name.
 */

import { YarmulkeManifestation } from './yarmulke/manifestation.js';

/**
 * @constant HEADWEAR_MAP
 * @type {Object<string, typeof Vessel>}
 * @description
 * The mapping of Hat-Names to their Component classes.
 * Every entry is a specific Sefirah in the world of Attachments.
 */
export const HEADWEAR_MAP = {
    'yarmulke': YarmulkeManifestation,
    'kippah': YarmulkeManifestation, // Permutation of the same essence
    // Future hats (Shtreimel, Fedora, etc.) will be added here as new Maamarim.
};

/**
 * @class HeadwearFactory
 * @description The orchestrator that pulls a hat from the potential into the actual.
 */
export class HeadwearFactory {
    /**
     * @description Manifests a hat component by its name.
     * @param {string} name - The name of the hat.
     * @param {Object} props - Initialization properties.
     * @returns {Vessel|null} The manifested hat component.
     */
    static create(name, props) {
        const HatClass = HEADWEAR_MAP[name.toLowerCase()];
        return HatClass ? new HatClass(props) : null;
    }
}
