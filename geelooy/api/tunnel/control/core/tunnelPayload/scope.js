// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Resolves every public tunnel action to its honest coarse authority.
 * @description
 * The Awtsmoos is one, yet reading, coordinating, and reshaping remain distinct.
 * Awtsmoos.com lets mission observers read, delegated agents coordinate through
 * mission authority, and shared-room mutations enter only through room authority.
 */
const { TUNNEL_SCOPE } = require("../../../shared/scopeCatalog.js");
const Mission = require("./missionScopeFamilies.js");
const { RECOVERY_WRITE_ACTION_SET } = require(
	"../../routes/fsVessel/hostedVirtualOs/actionNames.js"
);

const COMMAND_ACTIONS = new Set([
	"command",
	"nodeScriptRun",
	"shellCommand"
]);

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

const WEBSITE_BROWSER_ACTIONS = new Set([
	"agent",
	"aiAgentSpawnWebsiteMission",
	"chatgptWebsiteLogout",
	"websiteAgentMissionMessage",
	"websiteAgentMissionStart"
]);

const WEBSITE_ROOM_ACTIONS = new Set([
	"websiteAgentMissionForget",
	"websiteAgentMissionStop"
]);

function requiredScope(action) {
	const text = String(action || "");
	if (text.startsWith("command") || COMMAND_ACTIONS.has(text)) {
		return TUNNEL_SCOPE.COMMAND;
	}
	if (text.startsWith("chrome") || WEBSITE_BROWSER_ACTIONS.has(text)) {
		return TUNNEL_SCOPE.BROWSER;
	}
	if (WEBSITE_ROOM_ACTIONS.has(text)) {
		return TUNNEL_SCOPE.ROOM;
	}
	if (Mission.isMissionRead(text)) {
		return TUNNEL_SCOPE.READ;
	}
	if (Mission.isAgentCoordination(text)) {
		return TUNNEL_SCOPE.MISSION;
	}
	if (text.startsWith("mission")) {
		return TUNNEL_SCOPE.ROOM;
	}
	if (writeActions().has(text)) {
		return TUNNEL_SCOPE.WRITE;
	}
	return TUNNEL_SCOPE.READ;
}

function writeActions() {
	return new Set([
		...FILESYSTEM_WRITE_ACTIONS,
		...RECOVERY_WRITE_ACTION_SET
	]);
}

module.exports = {
	COMMAND_ACTIONS,
	FILESYSTEM_WRITE_ACTIONS,
	MISSION_READ_ACTIONS: Mission.READ_ACTIONS,
	WEBSITE_BROWSER_ACTIONS,
	WEBSITE_ROOM_ACTIONS,
	requiredScope,
	writeActions
};
