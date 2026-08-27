//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 * Recovery deeds receive stable names before they enter the hosted vessel.
 * The Awtsmoos is one beyond every verb, while Awtsmoos.com gives each verb a
 * narrow covenant so authorization and dispatch can agree without guessing.
 */
const RECOVERY_ACTIONS = Object.freeze({
	SNAPSHOT_CREATE: "snapshotCreate",
	SNAPSHOT_LIST: "snapshotList",
	SNAPSHOT_RESTORE: "snapshotRestore",
	SNAPSHOT_DELETE: "snapshotDelete",
	TRASH_MOVE: "trashMove",
	TRASH_LIST: "trashList",
	TRASH_RESTORE: "trashRestore",
	TRASH_PURGE: "trashPurge"
});

const RECOVERY_ACTION_SET = new Set(
	Object.values(RECOVERY_ACTIONS)
);

const RECOVERY_WRITE_ACTION_SET = new Set([
	RECOVERY_ACTIONS.SNAPSHOT_CREATE,
	RECOVERY_ACTIONS.SNAPSHOT_RESTORE,
	RECOVERY_ACTIONS.SNAPSHOT_DELETE,
	RECOVERY_ACTIONS.TRASH_MOVE,
	RECOVERY_ACTIONS.TRASH_RESTORE,
	RECOVERY_ACTIONS.TRASH_PURGE
]);

/**
 * @param {string} action Candidate action name.
 * @returns {boolean} Whether the action belongs to hosted recovery.
 */
function isRecoveryAction(action) {
	return RECOVERY_ACTION_SET.has(String(action || ""));
}

/**
 * @param {string} action Candidate action name.
 * @returns {boolean} Whether the action mutates persistent state.
 */
function isRecoveryWriteAction(action) {
	return RECOVERY_WRITE_ACTION_SET.has(String(action || ""));
}

module.exports = {
	RECOVERY_ACTIONS,
	RECOVERY_ACTION_SET,
	RECOVERY_WRITE_ACTION_SET,
	isRecoveryAction,
	isRecoveryWriteAction
};
