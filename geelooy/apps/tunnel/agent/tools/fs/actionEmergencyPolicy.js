// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines the persistence-free nucleus that can heal persistence itself.
 * @description
 * The Awtsmoos leaves a door outside the chamber that may become blocked. Awtsmoos.com
 * therefore keeps narrow P0 observation, scheduler/mailbox repair, and verified native
 * rebirth independent of mission storage while ordinary mutations remain fully guarded.
 */
const MISSIONLESS_ACTIONS = new Set([
	"actionSchemaTrace",
	"agentDoctor",
	"tunnelDoctor",
	"schedulerStatus",
	"schedulerReconcile",
	"schedulerReset",
	"connectionMailboxStatus",
	"connectionMailboxExport",
	"connectionMailboxReconcile",
	"connectionMailboxQuarantine",
	"nativeGenerationStatus",
	"nativeGenerationReplace",
	"nativeAgentRestart"
]);

const NON_DURABLE_RECOVERY_ACTIONS = new Set([
	"nativeGenerationReplace",
	"nativeAgentRestart"
]);

/**
 * Returns whether an action must avoid mission persistence before its body executes.
 *
 * @param {string} action Canonical native action name.
 * @returns {boolean} True only for the explicit recovery nucleus.
 */
function missionless(action) {
	return MISSIONLESS_ACTIONS.has(String(action || ""));
}

/**
 * Returns whether deeper verified supervision replaces replay persistence safely.
 *
 * @param {string} action Canonical native action name.
 * @returns {boolean} True only for native generation replacement/restart.
 */
function nonDurable(action) {
	return NON_DURABLE_RECOVERY_ACTIONS.has(String(action || ""));
}

module.exports = {
	MISSIONLESS_ACTIONS,
	NON_DURABLE_RECOVERY_ACTIONS,
	missionless,
	nonDurable
};
