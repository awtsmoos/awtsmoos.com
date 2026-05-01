
/**
 * B"H
 * @module StateHub
 * @chapter The Unified Consciousness of the Commentary
 * @description
 * Just as all disparate souls are unified in their Source, 
 * this hub unites the micro-sefirot of state—coordinates, 
 * cache purification, and marginal registries—into one Chariot.
 */

// 1. The Core Memory
export { commentaryStore as data, commentaryStore } from "./state/store.js";

// 2. Spatial Awareness
export { 
    setCurrentVerse, 
    getCurrentVerse, 
    setCurrentSub, 
    getCurrentSub 
} from "./state/coordinates.js";

// 3. Spiritual Cleansing
export { invalidateVerseCache } from "./state/purifier.js";

// 4. Marginal Registry - HEALED AND ANCHORED
import { 
    getInlineAliases as _getList, 
    isAliasInline as _checkItem 
} from "./state/inline/RegistryLogic.js";

import { hideCommentsInline as _hideRitual } from "./inline/state.js";

/**
 * @function getInlineAliases
 * @description Retrieves the official list of manifest marginalians.
 */
export const getInlineAliases = () => _getList();

/**
 * @function isAliasInline
 * @description Confirms if a Guardian's name is written in the Margin.
 */
export const isAliasInline = (alias) => _checkItem(alias);

/**
 * @function hideCommentsInline
 * @description Dissolves a name from the margin, returning it to the sidebar.
 */
export const hideCommentsInline = (alias) => _hideRitual(alias);

console.log(`%c B"H - [Unified State Hub] Conduits fully repaired.`, "color: #00ff00; font-weight: 900;");
