// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

/**
 * @file Derives stable child, payload, and sibling-group identities for website agents.
 * @description
 * The Awtsmoos reveals many shluchim without making their kinship vague or new each
 * instant. Awtsmoos.com binds every sibling fan-out to one mission-and-sponsor group,
 * so peers can find one another while each durable child still owns a unique name.
 */
function stableChildId(missionId, sponsorAgentId, requestKey, role) {
	const digest = hash([missionId, sponsorAgentId, requestKey]).slice(0, 12);
	return `website_peer_${roleSlug(role)}_${digest}`;
}

/**
 * Returns one stable sibling group for every fan-out owned by the same mission sponsor.
 * An explicit group may be supplied only as a normalized logical label; it never
 * changes filesystem or project-root authority.
 *
 * @param {string} missionId Owning website mission id.
 * @param {string} sponsorAgentId Sponsoring logical agent id.
 * @param {string} requested Explicit caller group label when intentionally shared.
 * @returns {string} Stable spawn-group id.
 */
function stableSpawnGroupId(missionId, sponsorAgentId, requested = "") {
	const explicit = cleanLabel(requested, 64);
	if (explicit) return explicit;
	return `spawn_group_${hash([missionId, sponsorAgentId]).slice(0, 16)}`;
}

function stablePayloadKey(sponsorAgentId, request) {
	return hash([
		sponsorAgentId,
		request.role.toLowerCase(),
		request.scope.toLowerCase(),
		request.prompt.replace(/\s+/g, " ").trim().toLowerCase()
	]);
}

function peerName(role, ordinal) {
	return `Website ${String(role || "Specialist").trim()} Peer-${String(ordinal).padStart(2, "0")}`;
}

function roleSlug(role) {
	return cleanLabel(String(role || "specialist").toLowerCase(), 24) || "specialist";
}

function cleanLabel(value, limit) {
	return String(value || "")
		.trim()
		.replace(/[^a-zA-Z0-9_-]+/g, "_")
		.replace(/^_+|_+$/g, "")
		.slice(0, limit);
}

function hash(values) {
	return crypto.createHash("sha256")
		.update(values.map(value => String(value || "")).join("\0"))
		.digest("hex");
}

module.exports = {
	cleanLabel,
	peerName,
	roleSlug,
	stableChildId,
	stablePayloadKey,
	stableSpawnGroupId
};
