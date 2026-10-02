//B"H
// Boruch Hashem
// Blessed is He

const { dispatchOsFs } = require("../../osFs/index.js");
const ActionNames = require("./actionNames.js");
const ActionResult = require("./actionResult.js");
const { RecoveryRepository } = require("./recoveryRepository.js");
const { SnapshotActions } = require("./snapshotActions.js");
const { TrashActions } = require("./trashActions.js");
const { isHostedBatchAction } = require("./hostedBatchActions.js");
const { dispatchHostedBatch } = require("./hostedBatchDispatcher.js");
const { isPreviewAction } = require("./previewActions.js");
const { dispatchHostedPreview } = require("./previewDispatcher.js");
const { isSitePublicationAction } = require("./sitePublicationActions.js");
const { dispatchSitePublication } = require("./sitePublicationDispatcher.js");

/**
 * @module HostedVirtualOsDispatcher
 * @description
 * The Awtsmoos keeps filesystem, recovery, publication, preview, and batch vessels
 * distinct while one trusted identity flows through them. Awtsmoos.com routes real
 * preview deeds into the persistent gateway instead of returning diagnostic shadows.
 */

const DEFAULT_DEPENDENCIES = Object.freeze({
	dispatchHostedBatch,
	dispatchHostedPreview,
	dispatchOsFs,
	dispatchSitePublication
});

/** Route one hosted Virtual OS action through its bounded authority family. */
async function dispatchHostedVirtualOs(
	$i,
	userId,
	payload = {},
	dependencies = DEFAULT_DEPENDENCIES
) {
	const normalized = payload && typeof payload === "object" ? payload : {};
	const action = String(normalized.action || "list");
	if (ActionNames.isRecoveryAction(action)) {
		return dispatchRecovery($i, userId, normalized, dependencies.dispatchOsFs);
	}
	if (isPreviewAction(action)) {
		return dependencies.dispatchHostedPreview($i, userId, normalized);
	}
	if (isSitePublicationAction(action)) {
		return dependencies.dispatchSitePublication($i, userId, normalized);
	}
	if (isHostedBatchAction(action)) {
		return runHostedBatch($i, userId, normalized, dependencies);
	}
	return dependencies.dispatchOsFs($i, userId, normalized);
}

/** Keep every nested batch action inside the authenticated hosted dispatcher. */
async function runHostedBatch($i, userId, payload, dependencies) {
	const batchDispatcher = dependencies.dispatchHostedBatch || dispatchHostedBatch;
	const runHostedAction = nextPayload => dispatchHostedVirtualOs(
		$i,
		userId,
		nextPayload,
		dependencies
	);
	return batchDispatcher(payload, runHostedAction);
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
	dispatchHostedVirtualOs,
	runHostedBatch
};
