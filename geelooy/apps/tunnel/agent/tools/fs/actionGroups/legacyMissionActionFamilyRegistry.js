// B"H
// Boruch Hashem
// Blessed is He

const { buildCoreStartToAddTaskActions } = require("./missionActionFamilies/coreStartToAddTaskActions.js");
const { buildCoreCompleteTaskToNextActions } = require("./missionActionFamilies/coreCompleteTaskToNextActions.js");
const { buildCoreAnswerToHeartbeatActions } = require("./missionActionFamilies/coreAnswerToHeartbeatActions.js");
const { buildCoreCheckpointToDiscoverActions } = require("./missionActionFamilies/coreCheckpointToDiscoverActions.js");
const { buildGrowthExpandToPostCompletionActions } = require("./missionActionFamilies/growthExpandToPostCompletionActions.js");
const { buildGrowthSuperviseToLeaseActions } = require("./missionActionFamilies/growthSuperviseToLeaseActions.js");
const { buildGrowthLeaseRenewToReportActions } = require("./missionActionFamilies/growthLeaseRenewToReportActions.js");
const { buildProtocolProtocolStartToProtocolReviewActions } = require("./missionActionFamilies/protocolProtocolStartToProtocolReviewActions.js");
const { buildProtocolProtocolStatusToProtocolSimulateActions } = require("./missionActionFamilies/protocolProtocolStatusToProtocolSimulateActions.js");
const { buildRoomFoundationRoomCreateToRoomDiscoverAgentsActions } = require("./missionActionFamilies/roomFoundationRoomCreateToRoomDiscoverAgentsActions.js");
const { buildRoomFoundationRoomInviteAgentToRoomClaimTaskActions } = require("./missionActionFamilies/roomFoundationRoomInviteAgentToRoomClaimTaskActions.js");
const { buildRoomFoundationRoomHeartbeatToRoomSimulateActions } = require("./missionActionFamilies/roomFoundationRoomHeartbeatToRoomSimulateActions.js");
const { buildRoomRecoveryRoomFindActiveToRoomBrainstormActions } = require("./missionActionFamilies/roomRecoveryRoomFindActiveToRoomBrainstormActions.js");
const { buildRoomRecoveryRoomRecoverInterruptToRoomLoopPulseActions } = require("./missionActionFamilies/roomRecoveryRoomRecoverInterruptToRoomLoopPulseActions.js");
const { buildRoomRecoveryRoomLoopStatusToRoomClaimFileActions } = require("./missionActionFamilies/roomRecoveryRoomLoopStatusToRoomClaimFileActions.js");
const { buildRoomRecoveryRoomReleaseFileToRoomMergeCourtActions } = require("./missionActionFamilies/roomRecoveryRoomReleaseFileToRoomMergeCourtActions.js");
const { buildQueueFinalizationCycleToFinalizeActions } = require("./missionActionFamilies/queueFinalizationCycleToFinalizeActions.js");
const { buildQueueFinalizationEarlyFinalAttemptToGraphActions } = require("./missionActionFamilies/queueFinalizationEarlyFinalAttemptToGraphActions.js");
const { buildStepProtocolStepBrainstormToStepReviewActions } = require("./missionActionFamilies/stepProtocolStepBrainstormToStepReviewActions.js");
const { buildStepProtocolStepDeltaToNextPlanActions } = require("./missionActionFamilies/stepProtocolStepDeltaToNextPlanActions.js");
const { buildLoopLoopSeedToLoopCheckpointActions } = require("./missionActionFamilies/loopLoopSeedToLoopCheckpointActions.js");
const { buildProjectCollaborationProjectDiscoverToProjectInviteActions } = require("./missionActionFamilies/projectCollaborationProjectDiscoverToProjectInviteActions.js");
const { buildProjectCollaborationCollaborationUserMessageToAgentDelegateActions } = require("./missionActionFamilies/projectCollaborationCollaborationUserMessageToAgentDelegateActions.js");
const { buildProjectCollaborationAgentClaimToAgentCompleteActions } = require("./missionActionFamilies/projectCollaborationAgentClaimToAgentCompleteActions.js");

/**
 * @file Composes the readable mission action families in their historical order.
 * @description
 * The Awtsmoos holds many revealed deeds in one purpose; Awtsmoos.com joins small action
 * vessels without changing their names or ordering, so modularity removes retained lock
 * shadows while preserving the public mission surface exactly as agents knew its light.
 */
const FAMILY_BUILDERS = Object.freeze([
	buildCoreStartToAddTaskActions,
	buildCoreCompleteTaskToNextActions,
	buildCoreAnswerToHeartbeatActions,
	buildCoreCheckpointToDiscoverActions,
	buildGrowthExpandToPostCompletionActions,
	buildGrowthSuperviseToLeaseActions,
	buildGrowthLeaseRenewToReportActions,
	buildProtocolProtocolStartToProtocolReviewActions,
	buildProtocolProtocolStatusToProtocolSimulateActions,
	buildRoomFoundationRoomCreateToRoomDiscoverAgentsActions,
	buildRoomFoundationRoomInviteAgentToRoomClaimTaskActions,
	buildRoomFoundationRoomHeartbeatToRoomSimulateActions,
	buildRoomRecoveryRoomFindActiveToRoomBrainstormActions,
	buildRoomRecoveryRoomRecoverInterruptToRoomLoopPulseActions,
	buildRoomRecoveryRoomLoopStatusToRoomClaimFileActions,
	buildRoomRecoveryRoomReleaseFileToRoomMergeCourtActions,
	buildQueueFinalizationCycleToFinalizeActions,
	buildQueueFinalizationEarlyFinalAttemptToGraphActions,
	buildStepProtocolStepBrainstormToStepReviewActions,
	buildStepProtocolStepDeltaToNextPlanActions,
	buildLoopLoopSeedToLoopCheckpointActions,
	buildProjectCollaborationProjectDiscoverToProjectInviteActions,
	buildProjectCollaborationCollaborationUserMessageToAgentDelegateActions,
	buildProjectCollaborationAgentClaimToAgentCompleteActions
]);

function buildLegacyMissionActionFamilies(runtime) {
	const actions = {};
	for (const buildFamily of FAMILY_BUILDERS) {
		Object.assign(actions, buildFamily(runtime));
	}
	return actions;
}

module.exports = {
	FAMILY_BUILDERS,
	buildLegacyMissionActionFamilies
};
