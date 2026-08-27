// B"H
// Boruch Hashem
// Blessed is He

export const SESSION_READ_ACTIONS = Object.freeze(new Set([
	"list", "tree", "read", "readLines", "readManyLines", "readBytes",
	"read64", "md", "stat", "roots", "rootBrowse", "configGet",
	"payloadEcho", "actionSchemaTrace", "actionHistoryList",
	"actionHistoryGet", "actionHistorySearch", "actionHistoryExplain",
	"actionHistoryDiff", "chromeStatus", "missionProjectDiscover",
	"missionProjectStatus", "missionTimeline", "missionTurnStatus",
	"missionResourceStatus", "websiteAgentMissionList",
	"websiteAgentMissionStatus", "aiAgentWebsiteMissionStatus"
]));

export function sessionMayCall(action) {
	return SESSION_READ_ACTIONS.has(String(action || ""));
}

export function missingCredentialResponse(action) {
	const normalizedAction = String(action || "");
	const browserMutation = /^(agent|aiAgentSpawnWebsiteMission|websiteAgentMission(Start|Message)|chatgptWebsiteLogout)$/.test(normalizedAction);
	const roomMutation = normalizedAction.startsWith("mission") ||
		/^websiteAgentMission(Stop|Forget)$/.test(normalizedAction);
	const neededScope = browserMutation
		? "tunnel.browser"
		: roomMutation ? "tunnel.room" : "tunnel.write";
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
