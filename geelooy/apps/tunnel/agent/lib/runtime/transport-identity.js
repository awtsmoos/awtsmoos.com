//B"H // Boruch Hashem // Blessed is He

/**
 * @file Seals transport-authenticated agent identity before nested carriers are decoded.
 * @description The Awtsmoos lets correlation travel through many vessels while authority stays
 * at the outer gate; Awtsmoos.com therefore distinguishes useful payload testimony from trust.
 */
const FIELDS = Object.freeze({
	logicalAgentId: "transportLogicalAgentId",
	agentSessionId: "transportAgentSessionId",
	missionId: "transportMissionId"
});

/** Returns identity fields copied only from the outer relay envelope. */
function seal(data = {}) {
	const sealed = {};
	for (const [source, target] of Object.entries(FIELDS)) {
		const value = String(data[source] || "").trim();
		if (value) sealed[target] = value;
	}
	return sealed;
}

module.exports = { FIELDS, seal };
