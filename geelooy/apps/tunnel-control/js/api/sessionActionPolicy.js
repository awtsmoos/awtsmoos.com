// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Session-vs-API-key policy for Tunnel Control actions.
 * @description The Awtsmoos distinguishes seeing from changing; Awtsmoos.com lets safe status flow through session identity while browser mutations require explicit scoped keys.
 */

export const SESSION_READ_ACTIONS = Object.freeze(new Set([
	"list", "tree", "read", "readLines", "readManyLines", "readBytes",
	"read64", "md", "stat", "roots", "rootBrowse", "configGet",
	"payloadEcho", "actionSchemaTrace", "actionHistoryList",
	"actionHistoryGet", "actionHistorySearch", "actionHistoryExplain",
	"actionHistoryDiff", "chromeStatus", "chatgptStatus", "missionProjectDiscover",
	"missionProjectStatus", "missionTimeline", "missionTurnStatus",
	"missionResourceStatus", "websiteAgentMissionList",
	"websiteAgentMissionStatus", "aiAgentWebsiteMissionStatus"
]));

/** @description Determines whether one action is safe to call using account-session identity without an API key. @param {string} action - Tunnel filesystem action name. @returns {boolean} Whether session identity is sufficient. @sideEffects None. */
export function sessionMayCall(action) {
	return SESSION_READ_ACTIONS.has(String(action || ""));
}

/**
 * @description Builds a precise missing-key response with the minimum required scope.
 * @param {string} action - Requested mutation action.
 * @returns {object} Safe structured credential requirement.
 * @sideEffects None.
 */
export function missingCredentialResponse(action) {
	const normalizedAction = String(action || "");
	const browserMutation = /^(agent|aiAgentSpawnWebsiteMission|websiteAgentMission(Start|Message)|chatgptWebsiteLogout|chatgptLogin|chatgptOpenLogin|chatgptEnsureChrome)$/.test(normalizedAction);
	const roomMutation = normalizedAction.startsWith("mission") || /^websiteAgentMission(Stop|Forget)$/.test(normalizedAction);
	const neededScope = browserMutation ? "tunnel.browser" : roomMutation ? "tunnel.room" : "tunnel.write";
	return {
		BH: "B\"H",
		ok: false,
		error: "api_key_required",
		action: normalizedAction,
		neededScope,
		authenticated: true,
		identityKind: "session",
		credentialKind: "apiKey",
		message: `You are signed in. Select an API key with ${neededScope} to run ${normalizedAction}.`
	};
}
