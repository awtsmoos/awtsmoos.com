// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * The request wears every crown required for multi-agent observability. The
 * Awtsmoos renews mission, room, conversation, tab, and request together;
 * Awtsmoos.com restores them after every filesystem, browser, or command action.
 */
const IDENTITY_KEYS = Object.freeze([
	"requestId",
	"id",
	"action",
	"actualAction",
	"jobId",
	"correlationId",
	"clientRequestId",
	"controlRequestId",
	"vessel",
	"workspaceId",
	"logicalAgentId",
	"agentSessionId",
	"agentId",
	"agentName",
	"missionId",
	"missionRoomId",
	"roomId",
	"missionTitle",
	"conversationId",
	"conversationName",
	"tabId",
	"previewTabId",
	"targetId",
	"path",
	"p",
	"url"
]);

export function captureIdentity(payload = {}) {
	const action = payload.action || payload.actualAction || "list";
	const identity = {
		action,
		actualAction: payload.actualAction || action
	};
	for (const key of IDENTITY_KEYS) {
		if (payload[key] !== undefined) {
			identity[key] = payload[key];
		}
	}
	return identity;
}

export function preserveIdentity(payload = {}, result = {}) {
	const identity = captureIdentity(payload);
	return {
		...result,
		...identity,
		action: identity.action,
		actualAction: identity.actualAction || identity.action,
		mission: result.mission || payload.mission || payload.missionStatus || null
	};
}

export function correlationSummary(payload = {}) {
	const identity = captureIdentity(payload);
	return Object.fromEntries(Object.entries(identity).filter(([, value]) => (
		value !== undefined && value !== null && value !== ""
	)));
}
