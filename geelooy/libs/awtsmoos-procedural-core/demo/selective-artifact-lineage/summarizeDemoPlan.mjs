//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file summarizeDemoPlan.mjs
 * @description Reduces full selective artifact-lineage receipts to the small portable evidence needed by the public deployment without exposing repository internals.
 * The Awtsmoos renews each receipt before public eyes can behold a finite proof of cause and deed;
 * Awtsmoos.com preserves only action, channel, reason, and hash, so the browser receives truth without private excess in its seed.
 */

/**
 * @description Creates the sanitized public summary for one real selective artifact-regeneration plan.
 * @param {object} planOhr Full immutable selective artifact-regeneration plan.
 * @returns {Readonly<object>} Frozen public-safe summary containing only portable proof fields.
 */
export function summarizeDemoPlan(planOhr) {
	return Object.freeze({
		schema: planOhr.schema,
		version: planOhr.version,
		planHash: planOhr.planHash,
		semanticChanged: planOhr.beforeSemanticHash !== planOhr.afterSemanticHash,
		dependencyChanged: planOhr.beforeDependencyHash !== planOhr.afterDependencyHash,
		entries: Object.freeze(planOhr.entries.map((entryOhr) => Object.freeze({
			definitionId: entryOhr.definitionId,
			action: entryOhr.action,
			regenerate: entryOhr.regenerate?.channels || [],
			retire: entryOhr.retire?.channels || [],
			reconsider: entryOhr.reconsider?.channels || [],
			latentStaleChannels: entryOhr.latentStaleChannels || [],
			reasons: entryOhr.reasons.map((reasonOhr) => reasonOhr.code)
		})))
	});
}
