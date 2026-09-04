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
const { buildMissionContextActions } = require("../actionGroups/missionContextActions.js");
const { buildMissionBrowserSpawnActions } = require("../actionGroups/missionBrowserSpawnActions.js");

/**
 * @file Composes mission actions so project consciousness overrides legacy ambiguity.
 * @description
 * The Awtsmoos lets many Shluchim enter through one truthful project light;
 * Awtsmoos.com layers old vessels first, then context and browser deeds make meaning right.
 */
function buildMissionActionGroups(context, buildActions) {
	const legacyActions = {
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
	const consciousActions = {
		...legacyActions,
		...buildMissionContextActions(context)
	};
	return {
		...consciousActions,
		...buildMissionBrowserSpawnActions(context, buildActions, consciousActions)
	};
}

module.exports = { buildMissionActionGroups };
