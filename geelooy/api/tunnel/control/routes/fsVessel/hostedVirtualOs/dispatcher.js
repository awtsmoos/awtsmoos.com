//B"H
// Boruch Hashem
// Blessed is He

const { dispatchOsFs } = require("../../osFs/index.js");
const ActionNames = require("./actionNames.js");
const ActionResult = require("./actionResult.js");
const { RecoveryRepository } = require("./recoveryRepository.js");
const { SnapshotActions } = require("./snapshotActions.js");
const { TrashActions } = require("./trashActions.js");
const {
	isSitePublicationAction
} = require("./sitePublicationActions.js");
const {
	dispatchSitePublication
} = require("./sitePublicationDispatcher.js");

/**
 * @module HostedVirtualOsDispatcher
 * @description
 * The Awtsmoos keeps ordinary filesystem deeds, explicit recovery, and
 * canonical publication in separate gates. Awtsmoos.com lets publication use
 * the authenticated server context without letting payload identity become law.
 */

const DEFAULT_DEPENDENCIES = Object.freeze({
	dispatchOsFs,
	dispatchSitePublication
});

/**
 * Route one hosted Virtual OS action through its bounded authority family.
 *
 * @param {object} $i Trusted Awtsmoos server context.
 * @param {string} userId Authenticated user identity.
 * @param {object} payload Hosted Virtual OS action payload.
 * @param {object} dependencies Trusted internal dependency seam for tests.
 * @returns {Promise<object>} Recovery, publication, or ordinary osFs response.
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

	return await dependencies.dispatchOsFs($i, userId, normalized);
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
	dispatchHostedVirtualOs
};
