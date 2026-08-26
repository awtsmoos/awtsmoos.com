// B"H
// Boruch Hashem
// Blessed is He

const { handleFsAction } = require("./actions.js");
const Executor = require("./executor/index.js");
const Ownership = require("./actionProcessOwnership.js");

const LIVE_HISTORY_ACTIONS = new Set([
	"actionHistoryGet",
	"actionHistoryList",
	"actionHistorySearch"
]);

/**
 * @file Chooses parent residency or isolated filesystem execution explicitly.
 * @description
 * The Awtsmoos gives each deed its proper vessel. Awtsmoos.com keeps work that owns
 * live parent objects beside those objects, while ordinary filesystem work enters a
 * witnessed worker pool whose isolation cannot sever recovery from the state it heals.
 */
async function handleFs(payload = {}, webSocket, executionObserver = null) {
	if (process.env.AWTSMOOS_FS_EXECUTOR_CHILD === "1") {
		return handleFsAction(payload, null);
	}
	if (!requiresExecutor(payload)) {
		executionObserver?.mark?.("fs_local_started", {
			consumerStarted: true,
			queued: false
		});
		return handleFsAction(payload, webSocket);
	}
	return Executor.execute(payload, executionObserver);
}

/**
 * Determines whether one filesystem-surface action must cross the worker boundary.
 *
 * Parent-resident actions include live mailbox recovery. Sending those actions to a
 * worker would load a different module-global registry and make the real controller
 * mailbox invisible even while connection health still sees it.
 *
 * @param {object} payload Normalized filesystem request.
 * @returns {boolean} True when isolated worker assignment is required.
 */
function requiresExecutor(payload = {}) {
	const action = String(payload.action || "");
	if (Ownership.isParentResidentAction(action)) return false;
	if (!LIVE_HISTORY_ACTIONS.has(action)) return true;
	return !isCompactHistoryRequest(payload);
}

/**
 * Returns whether a history request is safe to answer from parent-owned live memory.
 * @param {object} payload History request options.
 * @returns {boolean} True for compact non-debug history reads.
 */
function isCompactHistoryRequest(payload = {}) {
	const responseMode = String(
		payload.responseMode || payload.mode || ""
	).toLowerCase();
	return payload.full !== true &&
		payload.compact !== false &&
		!["full", "debug", "audit", "raw"].includes(responseMode);
}

module.exports = {
	LIVE_HISTORY_ACTIONS,
	PROCESS_OWNED_ACTIONS: Ownership.PROCESS_OWNED_ACTIONS,
	PROCESS_OWNED_RECOVERY_ACTIONS: Ownership.PROCESS_OWNED_RECOVERY_ACTIONS,
	SOCKET_ACTIONS: Ownership.SOCKET_ACTIONS,
	handleFs,
	isCompactHistoryRequest,
	requiresExecutor
};
