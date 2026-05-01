
/**
 * B"H
 * @module InlineAggregatorHub
 * @chapter Unity of the Margins
 */

// Providers from the 'providers/' chamber
export { getInlineAliases, isAliasInline } from "./inline/providers/StateProvider.js";
export { manifestAliasInline, manifestAllActiveInlines } from "./inline/providers/ManifestProvider.js";
export { addCommentsInline } from "./inline/providers/PlacementProvider.js";

// Integration from the 'Mutator' chamber
import { toggleInlineForComments as _toggleSwitch } from "./inline/Mutator.js";
/** @function toggleInlineForComments */
export const toggleInlineForComments = _toggleSwitch;

console.log(`%c B"H - [Inline Hub Aggregator] Vessels aligned and Conduits Open.`, "color: #00ffff; font-weight: 900;");
