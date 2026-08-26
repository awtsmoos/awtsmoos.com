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
const { buildMissionBrowserSpawnActions } = require("../actionGroups/missionBrowserSpawnActions.js");

/**
 * @file Composes mission actions and lets physical browser manifestation override logical-only spawn.
 * @description
 * The Awtsmoos lets many Shluchim share one mission without confusing intention with deed.
 * Awtsmoos.com preserves every historical mission layer, then places the browser bridge
 * last so missionSpawnNext may say success only when the proposed helper truly manifests.
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
	return {
		...legacyActions,
		...buildMissionBrowserSpawnActions(context, buildActions, legacyActions)
	};
}

module.exports = { buildMissionActionGroups };
