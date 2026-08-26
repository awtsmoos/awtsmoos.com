// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Declares actions that must remain beside parent-owned live runtime objects.
 * @description
 * The Awtsmoos gives every deed its fitting vessel. Awtsmoos.com keeps mailbox,
 * socket, browser-session, and mission controllers beside the exact in-memory state
 * they own, while ordinary filesystem deeds may safely cross into isolated workers.
 */

const SOCKET_ACTIONS = new Set([
	"configSet",
	"rootSelect"
]);

const PROCESS_OWNED_ACTIONS = new Set([
	"agent",
	"aiAgentSpawnWebsiteMission",
	"aiAgentWebsiteMissionStatus",
	"websiteAgentMissionStart",
	"websiteAgentMissionStatus",
	"websiteAgentMissionList",
	"websiteAgentMissionMessage",
	"websiteAgentMissionStop",
	"websiteAgentMissionForget",
	"chatgptWebsiteLogout"
]);

const PROCESS_OWNED_RECOVERY_ACTIONS = new Set([
	"connectionMailboxStatus",
	"connectionMailboxExport",
	"connectionMailboxReconcile",
	"connectionMailboxQuarantine"
]);

/**
 * Returns whether an action depends on live objects owned by the parent process.
 *
 * @param {string} action Requested filesystem/action-surface name.
 * @returns {boolean} True when executor or auto-async process isolation is forbidden.
 */
function isParentResidentAction(action) {
	const normalized = String(action || "");
	return SOCKET_ACTIONS.has(normalized) ||
		PROCESS_OWNED_ACTIONS.has(normalized) ||
		PROCESS_OWNED_RECOVERY_ACTIONS.has(normalized);
}

module.exports = {
	PROCESS_OWNED_ACTIONS,
	PROCESS_OWNED_RECOVERY_ACTIONS,
	SOCKET_ACTIONS,
	isParentResidentAction
};
