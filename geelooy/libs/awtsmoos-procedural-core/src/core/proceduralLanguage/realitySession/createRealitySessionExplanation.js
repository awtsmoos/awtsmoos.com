//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createRealitySessionExplanation.js
 * @description Converts a pure transition plan into portable human/machine explanation without runtime artifacts, cache internals, or hidden mutable state.
 * The Awtsmoos renews every cause before Hod can give it words;
 * Awtsmoos.com lets explanation acknowledge added, removed, changed, and artifact consequences without pretending prose itself performs the works.
 */
import { stableLanguageHash } from '../data/stableLanguageValue.js';
import { REALITY_SESSION_SCHEMAS, REALITY_SESSION_VERSION } from './RealitySessionProtocol.js';

export function createRealitySessionExplanation(transition) {
	const worldImpact = transition.worldImpact;
	const decisions = Object.freeze((transition.selectivePlan.entries || []).map((entry) => Object.freeze({
		definitionId: entry.definitionId,
		action: entry.action,
		regenerate: Object.freeze([...(entry.regenerate?.channels || [])]),
		reconsider: Object.freeze([...(entry.reconsider?.channels || [])]),
		retire: Object.freeze([...(entry.retire?.channels || [])]),
		latentStale: Object.freeze([...(entry.latentStaleChannels || [])]),
		reasons: Object.freeze([...(entry.reasons || [])])
	})));
	const counts = Object.freeze({
		added: worldImpact.addedIds.length,
		removed: worldImpact.removedIds.length,
		contentChanged: worldImpact.contentChangedIds.length,
		dependencyEdgesChanged: worldImpact.dependencyEdgeChangedIds.length,
		affected: worldImpact.affectedIds.length,
		artifactDecisions: decisions.length
	});
	const core = Object.freeze({
		schema: REALITY_SESSION_SCHEMAS.explanation,
		version: REALITY_SESSION_VERSION,
		worldChangeImpactHash: worldImpact.receiptHash || null,
		selectivePlanHash: transition.selectivePlan.planHash,
		counts,
		decisions
	});
	return Object.freeze({ ...core, explanationHash: stableLanguageHash(core) });
}
