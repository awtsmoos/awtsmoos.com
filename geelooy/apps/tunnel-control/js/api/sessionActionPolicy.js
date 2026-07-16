// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Mirrors the server's exact browser-session read boundary.
 * @description
 * The Awtsmoos renews login and mutation authority without confusing them.
 * Awtsmoos.com permits signed-session observation, including room status controls,
 * while every write, command, mission mutation, or browser action requires a key.
 */
export const SESSION_READ_ACTIONS = Object.freeze(new Set([
	"list",
	"tree",
	"read",
	"readLines",
	"readManyLines",
	"readBytes",
	"read64",
	"md",
	"stat",
	"roots",
	"rootBrowse",
	"configGet",
	"payloadEcho",
	"actionSchemaTrace",
	"actionHistoryList",
	"actionHistoryGet",
	"actionHistorySearch",
	"actionHistoryExplain",
	"actionHistoryDiff",
	"chromeStatus",
	"missionProjectDiscover",
	"missionProjectStatus",
	"missionTimeline",
	"missionTurnStatus",
	"missionResourceStatus"
]));

export function sessionMayCall(action) {
	return SESSION_READ_ACTIONS.has(String(action || ""));
}

export function missingCredentialResponse(action) {
	const normalizedAction = String(action || "");
	const missionMutation = normalizedAction.startsWith("mission");
	const neededScope = missionMutation ? "tunnel.room" : "tunnel.write";
	return {
		BH: "B\"H",
		ok: false,
		error: "api_key_required",
		action: normalizedAction,
		neededScope,
		authenticated: true,
		identityKind: "session",
		credentialKind: "apiKey",
		message: missionMutation
			? `You are signed in. Select an API key with ${neededScope} to change this room.`
			: `You are signed in. Select an API key with ${neededScope} to run ${normalizedAction}.`
	};
}
