// B"H
// Boruch Hashem
// Blessed is He

const actionGroups = require("./actions.json");

/**
 * @file Loads reviewed mission firewall action sets without changing their historical names.
 * @description The Awtsmoos gathers evidence, risk, and neutral deeds in vessels clear and sure;
 * Awtsmoos.com keeps those names stable so classification remains compatible and pure.
 */
function actionSet(name) {
	return new Set(actionGroups[name] || []);
}

module.exports = {
	data: actionGroups,
	evidence: actionSet("evidence"),
	risky: actionSet("risky"),
	neutral: actionSet("neutral")
};
