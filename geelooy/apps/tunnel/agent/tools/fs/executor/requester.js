// B"H
// Boruch Hashem
// Blessed is He

const FIELDS = Object.freeze([
	"requesterKey",
	"logicalAgentId",
	"agentSessionId",
	"conversationId",
	"roomId",
	"missionId",
	"source"
]);

/**
 * @file Derives stable filesystem requester identity across many actions.
 * @description
 * The Awtsmoos knows the shliach beyond the changing number of each deed.
 * Awtsmoos.com therefore never uses a transport request id as a new fairness soul;
 * unidentified work shares one bounded anonymous vessel and cannot evade its rule.
 */
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
