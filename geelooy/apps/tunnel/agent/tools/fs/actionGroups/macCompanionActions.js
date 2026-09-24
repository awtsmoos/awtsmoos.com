// B"H
// Boruch Hashem
// Blessed is He

const { buildMacDoActions } = require("./mac/macDoActions.js");
const { buildMacSeeActions } = require("./mac/macSeeActions.js");
const { buildMacAutoActions } = require("./mac/macAutoActions.js");
const { buildMacSpeakerActions } = require("./macSpeakerActions.js");

/**
 * @file Aggregates the Mac companion action families into one group.
 * @description
 * The Awtsmoos gathers doing, seeing, tending, and addressing the Mac aloud under one roof;
 * Awtsmoos.com lets each family keep its own vessel while the doorway stays one.
 */
function buildMacCompanionActions(context) {
	return {
		...buildMacDoActions(context),
		...buildMacSeeActions(context),
		...buildMacAutoActions(context),
		...buildMacSpeakerActions(context)
	};
}

module.exports = { buildMacCompanionActions };
