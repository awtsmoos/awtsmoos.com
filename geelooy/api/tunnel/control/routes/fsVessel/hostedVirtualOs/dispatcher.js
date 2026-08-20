//B"H
// Boruch Hashem
// Blessed is He

const { dispatchOsFs } = require("../../osFs/index.js");
const { runActionBatch } = require("../../osFs/actionBatch.js");
const ActionNames = require("./actionNames.js");
const ActionResult = require("./actionResult.js");
const { RecoveryRepository } = require("./recoveryRepository.js");
const { SnapshotActions } = require("./snapshotActions.js");
const { TrashActions } = require("./trashActions.js");
const { isHostedBatchAction } = require("./hostedBatchActions.js");
const { isSitePublicationAction } = require("./sitePublicationActions.js");
const { dispatchSitePublication } = require("./sitePublicationDispatcher.js");

/**
 * @module HostedVirtualOsDispatcher
 * @description
 * The Awtsmoos keeps filesystem, recovery, publication, and batch vessels
 * distinct while one trusted identity flows through them. Awtsmoos.com lets
 * older clients batch newer hosted deeds without falling beneath authority.
 */

const DEFAULT_DEPENDENCIES = Object.freeze({
	dispatchOsFs,
	dispatchSitePublication,
	runActionBatch
});

/**
 * Route one hosted Virtual OS action through its bounded authority family.
 *
 * @param {object} $i Trusted Awtsmoos server context.
 * @param {string} userId Authenticated user identity.
 * @param {object} payload Hosted Virtual OS action payload.
 * @param {object} dependencies Trusted internal dependency seam for tests.
 * @returns {Promise<object>} Hosted action response.
 */
async function dispatchHostedVirtualOs(
	$i,
	userId,
	payload = {},
	dependencies = DEFAULT_DEPENDENCIES
) {
	const normalized = payload && typeof payload === "object" ? payload : {};
	const action = String(normalized.action || "list");

	if (ActionNames.isRecoveryAction(action)) {
		return await dispatchRecovery($i, userId, normalized, dependencies.dispatchOsFs);
	}

	if (isSitePublicationAction(action)) {
		return await dependencies.dispatchSitePublication($i, userId, normalized);
	}

	if (isHostedBatchAction(action)) {
		return await dispatchHostedBatch($i, userId, normalized, dependencies);
	}

	return await dependencies.dispatchOsFs($i, userId, normalized);
}

/**
 * Re-enter hosted dispatch for every nested batch step so authority is kept.
 *
 * @param {object} $i Trusted server context.
 * @param {string} userId Authenticated user identity.
 * @param {object} payload Batch payload.
 * @param {object} dependencies Trusted dependency seam.
 * @returns {Promise<object>} Batch receipt.
 */
async function dispatchHostedBatch($i, userId, payload, dependencies) {
	const batchRunner = dependencies.runActionBatch || runActionBatch;
	const runHostedAction = nextPayload => dispatchHostedVirtualOs(
		$i,
		userId,
		nextPayload,
		dependencies
	);

	return await batchRunner(payload, runHostedAction);
}

async function dispatchRecovery($i, userId, payload, osDispatch) {
	const action = String(payload.action || "list");
	const dispatch = nextPayload => osDispatch($i, userId, nextPayload);
	const repository = new RecoveryRepository();
	const snapshots = new SnapshotActions($i, userId, dispatch, repository);
	const trash = new TrashActions($i, userId, dispatch, repository);
	const handlers = {
		[ActionNames.RECOVERY_ACTIONS.SNAPSHOT_CREATE]: () => snapshots.create(payload),
		[ActionNames.RECOVERY_ACTIONS.SNAPSHOT_LIST]: () => snapshots.list(payload),
		[ActionNames.RECOVERY_ACTIONS.SNAPSHOT_RESTORE]: () => snapshots.restore(payload),
		[ActionNames.RECOVERY_ACTIONS.SNAPSHOT_DELETE]: () => snapshots.delete(payload),
		[ActionNames.RECOVERY_ACTIONS.TRASH_MOVE]: () => trash.move(payload),
		[ActionNames.RECOVERY_ACTIONS.TRASH_LIST]: () => trash.list(payload),
		[ActionNames.RECOVERY_ACTIONS.TRASH_RESTORE]: () => trash.restore(payload),
		[ActionNames.RECOVERY_ACTIONS.TRASH_PURGE]: () => trash.purge(payload)
	};

	try {
		const fields = await handlers[action]();
		return ActionResult.success(action, fields);
	} catch (error) {
		return ActionResult.failure(error, action);
	}
}

module.exports = {
	DEFAULT_DEPENDENCIES,
	dispatchHostedBatch,
	dispatchHostedVirtualOs
};
