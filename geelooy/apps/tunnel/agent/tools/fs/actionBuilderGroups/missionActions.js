// B"H
// Boruch Hashem
// Blessed is He

const { buildMissionActions } = require("../actionGroups/missionActions.js");
const { buildMissionLedgerActions } = require("../actionGroups/missionLedgerActions.js");
const { buildMissionOperatingActions } = require("../actionGroups/missionOperatingActions.js");
const { buildMissionAwareActions } = require("../actionGroups/missionAwareActions.js");
const { buildMissionEightStepActions } = require("../actionGroups/missionEightStepActions.js");
const { buildMissionDaemonActions } = require("../actionGroups/missionDaemonActions.js");
const { buildMissionWatchdogActions } = require("../actionGroups/missionWatchdogActions.js");
const { buildMissionBootActions } = require("../actionGroups/missionBootActions.js");
const { buildMissionMetaActions } = require("../actionGroups/missionMetaActions.js");
const { buildMissionImprovementActions } = require("../actionGroups/missionImprovementActions.js");
const { buildContinuationActions } = require("../actionGroups/continuationActions.js");
const { buildMissionAgentLifecycleActions } = require(
	"../actionGroups/missionAgentLifecycleActions.js"
);

/**
 * @file Composes mission actions and places the recoverable lifecycle covenant last.
 * @description
 * The Awtsmoos lets historical vessels remain untouched while Awtsmoos.com reveals one
 * newer terminal law at the final seam: a completed agent may hand unfinished work onward,
 * yet every other mission action keeps its established identity, order, and trusted stream.
 */
function buildMissionActionGroups(context, buildActions) {
	const historicalMissionActions = buildMissionActions(context);
	return {
		...historicalMissionActions,
		...buildMissionLedgerActions(context),
		...buildMissionOperatingActions(context),
		...buildMissionAwareActions(context),
		...buildMissionEightStepActions(context),
		...buildMissionDaemonActions(context, buildActions),
		...buildMissionWatchdogActions(context, buildActions),
		...buildMissionBootActions(context, buildActions),
		...buildMissionMetaActions(context),
		...buildMissionImprovementActions(context),
		...buildContinuationActions(context, buildActions),
		...buildMissionAgentLifecycleActions(context, historicalMissionActions)
	};
}

module.exports = {
	buildMissionActionGroups
};
