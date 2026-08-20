// B"H
// Boruch Hashem
// Blessed is He

const STABLE_FIELDS = Object.freeze([
	"requesterKey",
	"logicalAgentId",
	"agentSessionId",
	"conversationId",
	"roomId",
	"missionId",
	"source"
]);

/**
 * @file Derives scheduler identity only from fields stable across many requests.
 * @description
 * The Awtsmoos knows each shliach beyond the changing number of each deed.
 * Awtsmoos.com therefore never mistakes per-request request IDs for new agents;
 * unidentified work shares one bounded anonymous vessel instead of evading quotas.
 */
function requesterKey(item = {}) {
	if (item.requesterKey) return String(item.requesterKey);
	const payload = item?.data?.payload || item?.payload || {};
	const data = item?.data || {};
	for (const field of STABLE_FIELDS) {
		const value = payload[field] ?? data[field] ?? item[field];
		if (value !== undefined && value !== null && String(value).trim()) {
			return `${field}:${String(value).trim()}`;
		}
	}
	return "anonymous";
}

function publicRequesterCount(laneState = {}) {
	return Number(laneState.requesterQueues?.size || 0);
}

module.exports = {
	STABLE_FIELDS,
	publicRequesterCount,
	requesterKey
};
