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

/**
 * @file Composes mission, room, watchdog, and continuation actions in their historical order.
 * @description
 * The Awtsmoos lets many Shluchim share one mission without confusing hand with crown;
 * Awtsmoos.com keeps every room and continuation layer ordered, so durable memory flows safely down.
 */
function buildMissionActionGroups(context, buildActions) {
	return {
		...buildMissionActions(context),
		...buildMissionLedgerActions(context),
		...buildMissionOperatingActions(context),
		...buildMissionAwareActions(context),
		...buildMissionEightStepActions(context),
		...buildMissionDaemonActions(context, buildActions),
		...buildMissionWatchdogActions(context, buildActions),
		...buildMissionBootActions(context, buildActions),
		...buildMissionMetaActions(context),
		...buildMissionImprovementActions(context),
		...buildContinuationActions(context, buildActions)
	};
}

module.exports = { buildMissionActionGroups };
