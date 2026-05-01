
/**
 * B"H
 * @module StateProvider
 * @chapter Providing the Divine Reshimu
 */

import { getInlineAliases as _hubList, isAliasInline as _hubCheck } from "../state.js";

/**
 * @function getInlineAliases
 * @description Directly provides the registry list from the Hub.
 */
export const getInlineAliases = () => _hubList();

/**
 * @function isAliasInline
 * @description Directly verifies a name's presence.
 */
export const isAliasInline = (alias) => _hubCheck(alias);
