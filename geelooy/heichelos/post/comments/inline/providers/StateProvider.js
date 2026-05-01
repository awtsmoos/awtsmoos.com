
/**
 * B"H
 * @module StateProvider
 * @chapter Serving the Reshimu of the Border
 * @description
 * Provides the current state of the Marginal Ledger to the 
 * Manifestation Conductor. By drawing directly from the logic leaf,
 * we bypass circularity and achieve a pure flow of data.
 */

import { 
    getInlineAliases as _fetchActive, 
    isAliasInline as _verifyPresence 
} from "../../state/inline/RegistryLogic.js";

/**
 * @function getInlineAliases
 * @description The Sovereign request for the manifest names.
 */
export const getInlineAliases = () => _fetchActive();

/**
 * @function isAliasInline
 * @description The Sovereign verification of a name's presence.
 */
export const isAliasInline = (alias) => _verifyPresence(alias);
