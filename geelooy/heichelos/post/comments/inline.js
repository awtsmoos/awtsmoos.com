
/**
 * B"H
 * @module InlineAggregatorHub
 * @chapter The Singularity of the Margins
 * @description
 * All conduits relating to Marginal (Inline) Insights flow through this hub.
 * It coordinates the state, the manifestation, and the removal of marginalia.
 * 
 * HEALED: Fixed the typo in the dissolve function import.
 */

// 1. Providers and State
export { getInlineAliases, isAliasInline } from "/heichelos/post/comments/inline/providers/StateProvider.js";

// 2. Main Manifestation Logic
import { UnifiedOrchestrator } from "/heichelos/post/comments/inline/coordination/UnifiedOrchestrator.js";
import { dissolveMarginalWeave as _dissolve } from "/heichelos/post/comments/logic/inlineManifest/MarginalDOMWeaver.js";

/** @function manifestAliasInline */
export const manifestAliasInline = (alias) => UnifiedOrchestrator.manifestSingle(alias);

/** @function manifestAllActiveInlines */
export const manifestAllActiveInlines = () => UnifiedOrchestrator.manifestAllActive();

/** @function dissolveAliasInline */
export const dissolveAliasInline = (alias) => _dissolve(alias);

// 3. Mutator Integration
import { toggleInlineForComments as _toggleSwitch } from "/heichelos/post/comments/inline/Mutator.js";
/** @function toggleInlineForComments */
export const toggleInlineForComments = _toggleSwitch;

console.log(`%c B"H - [Inline Hub] Aggregator conduits fully manifest and healed.`, "color: #00ffff; font-weight: 900;");
