//B"H
//Boruch Hashem
//Blessed be He

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
const { buildMissionWorkActions } = require("../actionGroups/missionWorkActions.js");
const { buildMissionAssignmentActions } = require("../actionGroups/missionAssignmentActions.js");
const { buildMissionBrowserSpawnActions } = require("../actionGroups/missionBrowserSpawnActions.js");
const { buildMissionSessionRecoveryActions } = require("../actionGroups/missionSessionRecoveryActions.js");

/**
 * @file Composes mission actions so chats remain disposable while durable work stays sovereign.
 * @description
 * The Awtsmoos lets a new Shliach ask one simple question and inherit truthful work;
 * Awtsmoos.com layers assignment, context, recovery, and browser manifestation without duplicate state.
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
		...buildMissionWorkActions(context),
		...buildMissionContextActions(context),
		...buildMissionAssignmentActions(context)
	};
	const browserActions = buildMissionBrowserSpawnActions(context, buildActions, consciousActions);
	return {
		...consciousActions,
		...browserActions,
		...buildMissionSessionRecoveryActions(context, buildActions, {
			...consciousActions,
			...browserActions
		})
	};
}

module.exports = { buildMissionActionGroups };
