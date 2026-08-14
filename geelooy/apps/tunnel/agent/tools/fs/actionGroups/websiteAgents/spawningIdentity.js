// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

/** Creates sponsor-scoped stable identities without encoding a recursive depth. */
function stableChildId(missionId, sponsorAgentId, requestKey, role) {
	const digest = crypto.createHash("sha256")
		.update([missionId, sponsorAgentId, requestKey].join("\0"))
		.digest("hex")
		.slice(0, 12);
	return `website_peer_${roleSlug(role)}_${digest}`;
}

function stablePayloadKey(sponsorAgentId, request) {
	return crypto.createHash("sha256")
		.update([
			sponsorAgentId,
			request.role.toLowerCase(),
			request.scope.toLowerCase(),
			request.prompt.replace(/\s+/g, " ").trim().toLowerCase()
		].join("\0"))
		.digest("hex");
}

function peerName(role, ordinal) {
	return `Website ${String(role || "Specialist").trim()} Peer-${String(ordinal).padStart(2, "0")}`;
}

function roleSlug(role) {
	return String(role || "specialist")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "")
		.slice(0, 24) || "specialist";
}

module.exports = { peerName, stableChildId, stablePayloadKey };
