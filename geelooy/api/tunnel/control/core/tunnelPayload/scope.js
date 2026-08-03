//B"H
//Boruch Hashem
//Blessed is He

const { RECOVERY_WRITE_ACTION_SET } = require(
	"../../routes/fsVessel/hostedVirtualOs/actionNames.js"
);

const FILESYSTEM_WRITE_ACTIONS = Object.freeze([
	"applyPatch", "bulkWrite", "bulkWriteIfHashes", "configSet", "copyFile",
	"copyTree", "delete", "deleteFile", "deleteTree", "ensureFile",
	"findReplace", "insertAfterFunction", "insertAfterScope",
	"insertBeforeFunction", "insertBeforeScope", "makeFolder", "mkdir",
	"mkdirp", "moveFile", "moveTree", "replaceFunction",
	"replaceFunctionBody", "replaceMethod", "replaceRange", "replaceScope",
	"replaceScopeBody", "replaceSymbol", "rootSelect", "touch", "write",
	"writeIfHash"
]);

const MISSION_READ_ACTIONS = new Set([
	"missionProjectDiscover", "missionProjectStatus", "missionTimeline",
	"missionTurnStatus", "missionResourceStatus", "missionReport",
	"missionAwareStatus", "websiteAgentMissionList",
	"websiteAgentMissionStatus", "aiAgentWebsiteMissionStatus"
]);

const WEBSITE_BROWSER_ACTIONS = new Set([
	"agent", "aiAgentSpawnWebsiteMission", "websiteAgentMissionStart",
	"websiteAgentMissionMessage", "chatgptWebsiteLogout"
]);

const WEBSITE_ROOM_ACTIONS = new Set([
	"websiteAgentMissionStop", "websiteAgentMissionForget"
]);

/**
 * B"H
 * Authority follows the deed. Website submissions need browser authority,
 * room mutations need room authority, and observation remains a read.
 */
function requiredScope(action) {
	const text = String(action || "");

	if (text.startsWith("command") || text === "command" || text === "nodeScriptRun") {
		return "tunnel.command";
	}

	if (text.startsWith("chrome") || WEBSITE_BROWSER_ACTIONS.has(text)) {
		return "tunnel.browser";
	}

	if (WEBSITE_ROOM_ACTIONS.has(text)) {
		return "tunnel.room";
	}

	if (text.startsWith("mission") && !MISSION_READ_ACTIONS.has(text)) {
		return "tunnel.room";
	}

	if (writeActions().has(text)) {
		return "tunnel.write";
	}

	return "tunnel.read";
}

function writeActions() {
	return new Set([
		...FILESYSTEM_WRITE_ACTIONS,
		...RECOVERY_WRITE_ACTION_SET
	]);
}

module.exports = {
	FILESYSTEM_WRITE_ACTIONS,
	MISSION_READ_ACTIONS,
	WEBSITE_BROWSER_ACTIONS,
	WEBSITE_ROOM_ACTIONS,
	requiredScope,
	writeActions
};
