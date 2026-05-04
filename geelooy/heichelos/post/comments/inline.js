
/**
 * B"H
 * @module InlineAggregatorHub
 * @chapter The Singularity of the Margins
 * @description
 * All conduits relating to Marginal (Inline) Insights flow through this hub.
 * It coordinates the state, the manifestation, and the removal of marginalia.
 * 
 * HEALED: Re-integrated the 'toggleInlineForComments' export to resolve 
 * importation ruptures in the Sidebar Council (KeeperRowFactory).
 */

// 1. Providers and State
export { getInlineAliases, isAliasInline } from "./inline/providers/StateProvider.js";

// 2. Main Manifestation Logic
import { UnifiedOrchestrator } from "./inline/coordination/UnifiedOrchestrator.js";
import { dissolveMarginalWeave as _dissolve } from "./logic/inlineManifest/MarginalDOMWeaver.js";

/** @function manifestAliasInline */
export const manifestAliasInline = (alias) => UnifiedOrchestrator.manifestSingle(alias);

/** @function manifestAllActiveInlines */
export const manifestAllActiveInlines = () => UnifiedOrchestrator.manifestAllActive();

/** @function dissolveAliasInline */
export const dissolveAliasInline = (alias) => _dissolve(alias);

// 3. Mutator Integration
import { toggleInlineForComments as _toggleSwitch } from "./inline/Mutator.js";
/** @function toggleInlineForComments */
export const toggleInlineForComments = _toggleSwitch;

console.log(`%c B"H - [Inline Hub] Aggregator fully manifest and conduits restored.`, "color: #00ffff; font-weight: 900;");
