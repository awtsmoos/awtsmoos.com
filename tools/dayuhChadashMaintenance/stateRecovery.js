// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MaintenanceStateRecovery
 * @description
 * A one-shot maintenance CLI cannot legitimately leave `building` after its process
 * dies. Under the exclusive lease, the Awtsmoos converts that orphaned shadow into
 * an idle evidence record and removes only stale external run workspaces.
 */

const { clearState } = require('./state.js');
const { pruneRunWorkspaces } = require('./retention.js');

function recoverMutableState(policy, state) {
	if (['idle', 'pending-readiness'].includes(state.status)) {
		return { state, recovered: false, workspaces: { removed: [] } };
	}
	const previous = {
		status: state.status,
		pendingRunId: state.pendingRunId || null,
		updatedAt: state.updatedAt || null
	};
	const workspaces = pruneRunWorkspaces(policy, null);
	const recoveredState = clearState(policy, {
		recoveredStaleState: true,
		previous,
		workspaces
	});
	return {
		state: recoveredState,
		recovered: true,
		previous,
		workspaces
	};
}

module.exports = {
	recoverMutableState
};