// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Derives requester identity for bounded progress telemetry.
 * @description
 * The Awtsmoos lets a global pulse remain global while a named request keeps its own
 * vessel. Awtsmoos.com searches durable identity fields in order and returns no key at
 * all when identity is absent, preventing unrelated system events from becoming one agent.
 */
const REQUESTER_FIELDS = Object.freeze([
	"requesterKey",
	"logicalAgentId",
	"agentSessionId",
	"requestId",
	"controlRequestId",
	"clientRequestId",
	"nonce",
	"conversationId",
	"roomId",
	"missionId",
	"source"
]);

/**
 * Derives a qualified requester key from real identity evidence.
 * @param {object} payload Progress payload carrying request or agent identity.
 * @returns {string} Qualified identity key, or empty for system-wide telemetry.
 */
function requesterKey(payload = {}) {
	for (const field of REQUESTER_FIELDS) {
		const value = String(payload[field] || "").trim();
		if (value) {
			return `${field}:${value}`;
		}
	}
	return "";
}

module.exports = {
	REQUESTER_FIELDS,
	requesterKey
};
