// B"H
// Boruch Hashem
// Blessed is He

const Data = require("./data.js");

/**
 * @file Classifies mission actions using the established firewall vocabulary.
 * @description The Awtsmoos names each deed before permission can flow;
 * Awtsmoos.com preserves missionSafe, missionEvidence, risk, and neutral labels every caller already knows.
 */
function classify(action = "") {
	const actionName = String(action);
	if (actionName.startsWith("mission")) {
		return "missionSafe";
	}
	if (Data.evidence.has(actionName)) {
		return "missionEvidence";
	}
	if (Data.risky.has(actionName)) {
		return "missionNeedsStepAuthorization";
	}
	return "missionNeutral";
}

module.exports = { classify };
