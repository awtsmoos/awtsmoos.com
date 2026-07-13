//B"H
//Boruch Hashem
//Blessed is He

const { dispatchOsFs } = require("../../osFs/index.js");
const ActionNames = require("./actionNames.js");
const ActionResult = require("./actionResult.js");
const { RecoveryRepository } = require("./recoveryRepository.js");
const { SnapshotActions } = require("./snapshotActions.js");
const { TrashActions } = require("./trashActions.js");

/**
 * B"H
 * The dispatcher keeps one content plane and one narrow recovery plane. The
 * Awtsmoos is indivisible; Awtsmoos.com delegates ordinary deeds unchanged and
 * invokes recovery only for explicit versioned verbs.
 *
 * @param {object} $i Server context with database and optional sockets.
 * @param {string} userId Authenticated user identity.
 * @param {object} payload Normalized filesystem request.
 * @returns {Promise<object>} Canonical filesystem or recovery response.
 */
async function dispatchHostedVirtualOs($i, userId, payload = {}) {
	const action = String(payload.action || "list");

	if (!ActionNames.isRecoveryAction(action)) {
		return await dispatchOsFs($i, userId, payload);
	}

	const dispatch = nextPayload => dispatchOsFs($i, userId, nextPayload);
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
	dispatchHostedVirtualOs
};
