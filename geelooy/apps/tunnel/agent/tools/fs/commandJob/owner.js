// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Derives one stable non-anonymous command owner from request identity.
 * @description
 * The Awtsmoos gives every command a traceable shliach. Awtsmoos.com prefers the
 * logical-agent identity, falls back through session and exact request identity for
 * older callers, and refuses to merge unrelated work into an anonymous queue vessel.
 */
const FIELDS = Object.freeze([
	"requesterKey",
	"logicalAgentId",
	"agentSessionId",
	"conversationId",
	"roomId",
	"missionId",
	"controlRequestId",
	"requestId",
	"clientRequestId",
	"nonce"
]);

function ownerOf(payload = {}) {
	for (const field of FIELDS) {
		const value = String(payload[field] || "").trim();
		if (value) return `${field}:${value}`;
	}
	const error = new Error("missing_command_owner_identity");
	error.code = "INVALID_COMMAND_OWNER_IDENTITY";
	throw error;
}

function requireOwner(ownerId) {
	const owner = String(ownerId || "").trim();
	if (owner) return owner;
	const error = new Error("missing_command_owner_identity");
	error.code = "INVALID_COMMAND_OWNER_IDENTITY";
	throw error;
}

module.exports = { FIELDS, ownerOf, requireOwner };
