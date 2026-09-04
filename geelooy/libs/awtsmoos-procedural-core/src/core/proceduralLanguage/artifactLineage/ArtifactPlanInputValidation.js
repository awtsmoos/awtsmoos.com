//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ArtifactPlanInputValidation.js
 * @description Guards selective artifact planning against stale world-impact receipts and resolves only the direct patch chains that match current before/after identities.
 * The Awtsmoos renews every input before an old receipt can guide a new world astray;
 * Awtsmoos.com keeps validation beside lineage proof, so the coordinator can remain a narrow vessel for the way.
 */
import { ARTIFACT_LINEAGE_DIAGNOSTICS } from './ArtifactLineageProtocol.js';
import { resolveArtifactPatchChain } from './resolveArtifactPatchChain.js';

/**
 * @description Verifies that a world-impact receipt was created from the exact before/after semantic snapshots supplied to artifact planning.
 * @param {object} beforeSnapshot Before world semantic snapshot.
 * @param {object} afterSnapshot After world semantic snapshot.
 * @param {object} worldImpact World change-impact receipt.
 * @returns {void}
 * @throws {TypeError|RangeError} When required inputs are absent or hashes disagree.
 */
export function assertArtifactWorldImpactMatches(beforeSnapshot, afterSnapshot, worldImpact) {
	if (!beforeSnapshot || !afterSnapshot || !worldImpact) {
		throw new TypeError('Selective artifact regeneration requires beforeSnapshot, afterSnapshot, and worldImpact.');
	}
	const matches = worldImpact.beforeSemanticHash === beforeSnapshot.semanticHash
		&& worldImpact.afterSemanticHash === afterSnapshot.semanticHash
		&& worldImpact.beforeDependencyHash === beforeSnapshot.dependencyHash
		&& worldImpact.afterDependencyHash === afterSnapshot.dependencyHash;
	if (matches) {
		return;
	}
	const errorGevurah = new RangeError('World impact receipt does not match supplied semantic snapshots.');
	errorGevurah.code = ARTIFACT_LINEAGE_DIAGNOSTICS.WORLD_IMPACT_MISMATCH;
	throw errorGevurah;
}

/**
 * @description Resolves direct patch evidence only when a surviving Definition is marked content-changed in the current world impact.
 * @param {object} input Patch-chain resolution inputs.
 * @returns {Readonly<object>} Frozen validated patch-chain result.
 */
export function createArtifactPatchChainForDefinition(input = {}) {
	const {
		definitionId,
		beforeIdentity,
		afterIdentity,
		patchLookup,
		contentChangedIds
	} = input;
	if (!contentChangedIds.has(definitionId) || !beforeIdentity || !afterIdentity) {
		return createEmptyPatchChain();
	}
	return resolveArtifactPatchChain(
		patchLookup[definitionId] || [],
		beforeIdentity.contentHash,
		afterIdentity.contentHash
	);
}

/** Creates a shared immutable no-op patch-chain result for non-direct changes. */
function createEmptyPatchChain() {
	return Object.freeze({
		complete: true,
		receipts: Object.freeze([]),
		affectedChannels: Object.freeze([]),
		diagnostics: Object.freeze([])
	});
}
