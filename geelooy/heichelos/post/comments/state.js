
/**
 * B"H
 * @module StateAggregatorHub
 * @chapter The One in the Many
 * @description
 * From the infinite potential of the Essence (Awtsmoos) comes all 
 * particularized functions. This hub unites the shattering of the 
 * micro-sefirot into a single, functional Merkavah.
 */

// 1. Memory Access
export { commentaryStore as data, commentaryStore } from "./state/store.js";

// 2. Spatial Navigation
export { 
    setCurrentVerse, 
    getCurrentVerse, 
    setCurrentSub, 
    getCurrentSub 
} from "./state/coordinates.js";

// 3. Spiritual Cleansing
export { invalidateVerseCache } from "./state/purifier.js";

// 4. THE MARGINAL REGISTRY (Healed and re-fractured)
import { MarginalGuardianRegistry } from "./state/inline/Registry.js";
import { hideCommentsInline as _internalHideRitual } from "./inline/state.js";

/**
 * @function getInlineAliases
 * @description 
 * HEALED: Now points to the corrected 'getActive' ritual.
 */
export const getInlineAliases = () => MarginalGuardianRegistry.getActive();

/**
 * @function isAliasInline
 * @description Verifies a name in the Marginal records.
 */
export const isAliasInline = (alias) => MarginalGuardianRegistry.isPresent(alias);

/**
 * @function hideCommentsInline
 * @description Dissolves an Alias's registry back into potentiality.
 */
export const hideCommentsInline = (alias) => _internalHideRitual(alias);

console.log(`%c B"H - [Unified State Hub] The broken Link is healed. Registry is active.`, "color: #ccff00; font-weight: 900;");
