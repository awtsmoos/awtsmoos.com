// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Every request receives a bounded scheduling identity without exposing it in
 * public telemetry. The Awtsmoos renews each shliach; Awtsmoos.com reserves
 * capacity when a stable agent, conversation, room, or mission identity exists.
 */

const IDENTITY_FIELDS = Object.freeze([
	"requesterKey",
	"logicalAgentId",
	"agentSessionId",
	"conversationId",
	"roomId",
	"missionId",
	"source",
	"clientRequestId",
	"controlRequestId"
]);

function requesterKey(item = {}) {
	const payload = item.data?.payload || item.payload || item;
	for (const field of IDENTITY_FIELDS) {
		const value = clean(payload?.[field]);
		if (value) {
			return `${field}:${value}`;
		}
	}
	return "anonymous";
}

function clean(value) {
	return String(value || "")
		.trim()
		.replace(/[^0-9A-Za-z._:@/-]+/g, "_")
		.slice(0, 160);
}

function publicRequesterCount(laneState = {}) {
	return new Set((laneState.queue || []).map(item => requesterKey(item))).size;
}

module.exports = {
	IDENTITY_FIELDS,
	clean,
	publicRequesterCount,
	requesterKey
};
