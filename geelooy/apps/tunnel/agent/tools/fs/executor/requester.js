// B"H

const FIELDS = [
	"requesterKey",
	"logicalAgentId",
	"agentSessionId",
	"conversationId",
	"roomId",
	"missionId",
	"source",
	"clientRequestId"
];

/** Returns a stable, non-secret fairness identity for one action. */
function key(payload = {}) {
	for (const field of FIELDS) {
		const value = clean(payload[field]);
		if (value) return `${field}:${value}`;
	}
	return "anonymous";
}

function clean(value) {
	return String(value || "")
		.trim()
		.replace(/[^0-9A-Za-z._:@/-]+/g, "_")
		.slice(0, 160);
}

module.exports = {
	FIELDS,
	clean,
	key
};
