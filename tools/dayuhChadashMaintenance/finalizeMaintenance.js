// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module FinalizeMaintenance
 * @description
 * Completes a green generation. Raw mirrors require explicit social-content
 * authorization; derived cleanup and bounded retention remain independently safe.
 */

const { fullInventory } = require('./inventory.js');
const { cleanupDerived } = require('./cleanupDerived.js');
const {
	pruneEmptyLegacyComments,
	pruneMatchingMirrors
} = require('./pruneMirrors.js');
const { pruneArchives, pruneRunWorkspaces } = require('./retention.js');
const { clearState } = require('./state.js');

function finalizeState(policy, state, environment = process.env) {
	const mirrorAuthorization = environment.AWTSMOOS_PRUNE_RAW_MIRRORS === '1';
	const mirrorResult = mirrorAuthorization
		? pruneAuthorizedMirrors(state, policy)
		: { authorized: false, mirrors: [], comments: null };
	const derived = cleanupDerived(policy, { dryRun: false });
	const archives = pruneArchives(policy);
	const workspaces = pruneRunWorkspaces(policy, state.pendingRunId);
	const after = fullInventory(policy, { verify: true });
	const result = {
		mirrorAuthorization,
		...mirrorResult,
		derived,
		archives,
		workspaces,
		after
	};
	return {
		state: clearState(policy, result),
		result,
		changed: true
	};
}

function pruneAuthorizedMirrors(state, policy) {
	const mirrors = [];
	for (const item of state.installations || []) {
		if (!['posts', 'series'].includes(item.family)) continue;
		mirrors.push({
			family: item.family,
			result: pruneMatchingMirrors(item.live.file, policy.dataRoot)
		});
	}
	return {
		authorized: true,
		mirrors,
		comments: pruneEmptyLegacyComments(policy.dataRoot)
	};
}

module.exports = {
	finalizeState,
	pruneAuthorizedMirrors
};