
/**
 * B"H
 * @module InlineAggregatorHub
 * @chapter Unity of the Margins
 * @description
 * All conduits relating to Marginal (Inline) Insights flow through this hub.
 */

// 1. Providers from the 'providers/' chamber
export { getInlineAliases, isAliasInline } from "./inline/providers/StateProvider.js";
export { manifestAliasInline, manifestAllActiveInlines } from "./inline/providers/ManifestProvider.js";

// 2. Integration from the 'Mutator' chamber
import { toggleInlineForComments as _toggleSwitch } from "./inline/Mutator.js";
/** @function toggleInlineForComments */
export const toggleInlineForComments = _toggleSwitch;

console.log(`%c B"H - [Inline Hub] Conflicting logic purged. Singular flow established.`, "color: #00ffff; font-weight: 900;");
