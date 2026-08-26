// B"H
// Boruch Hashem
// Blessed is He

const { buildActionHistoryActions } = require("../actionGroups/actionHistoryActions.js");
const { buildActionStreamActions } = require("../actionGroups/actionStreamActions.js");
const { buildAsyncTaskActions } = require("../actionGroups/asyncTaskActions.js");
const { buildBatchAliasActions } = require("../actionGroups/batchAliasActions.js");
const { buildCognitionActions } = require("../actionGroups/cognitionActions.js");
const { buildCommandActions } = require("../actionGroups/commandActions.js");
const { buildConfigActions } = require("../actionGroups/configActions.js");
const { buildConnectionMailboxActions } = require("../actionGroups/connectionMailboxActions.js");
const { buildFakeSshActions } = require("../actionGroups/fakeSshActions.js");
const { buildFileOpsActions } = require("../actionGroups/fileOpsActions.js");
const { buildHttpActions } = require("../actionGroups/httpActionsGroup.js");
const { buildInstructionActions } = require("../actionGroups/instructionActions.js");
const { buildIsolatedActions } = require("../actionGroups/isolatedActions.js");
const { buildNativeGenerationActions } = require("../actionGroups/nativeGenerationActions.js");
const { buildNodeDomActions } = require("../actionGroups/nodeDomActions.js");
const { buildOsSurfaceActions } = require("../actionGroups/osSurfaceActions.js");
const { buildPortActions } = require("../actionGroups/portActions.js");
const { buildPreviewActions } = require("../actionGroups/previewActions.js");
const { buildPreviewReceiptActions } = require("../actionGroups/previewReceiptActions.js");
const { buildProjectActions } = require("../actionGroups/projectActions.js");
const { buildQualityActions } = require("../actionGroups/qualityActions.js");
const { buildReadActions } = require("../actionGroups/readActions.js");
const { buildRemoteDriveActions } = require("../actionGroups/remoteDriveActions.js");
const { buildRemoteNativeDesktopActions } = require("../actionGroups/remoteNativeDesktopActions.js");
const { buildRuntimeActions } = require("../actionGroups/runtimeActions.js");
const { buildScanWorkerActions } = require("../actionGroups/scanWorkerActions.js");
const { buildSchedulerEmergencyActions } = require("../actionGroups/schedulerEmergencyActions.js");
const { buildShareActions } = require("../actionGroups/shareActions.js");
const { buildStaticServerActions } = require("../actionGroups/staticServerActions.js");
const { buildTaskRuntimeActions } = require("../actionGroups/taskRuntimeActions.js");
const { buildVirtualOsGraphActions } = require("../actionGroups/virtualOsGraphActions.js");
const { buildWorkflowActions } = require("../actionGroups/workflowActions.js");
const { buildWriteActions } = require("../actionGroups/writeActions.js");

/**
 * @file Composes foundational actions while preserving independent recovery and doctrine doors.
 * @description
 * The Awtsmoos unites many vessels without making medicine depend on the wound.
 * Awtsmoos.com places emergency, generation repair, and instruction retrieval beside
 * foundations so diagnosis and law remain available before ordinary work begins.
 */
function buildFoundationActions(context, buildActions) {
	return {
		...buildSchedulerEmergencyActions(context),
		...buildNativeGenerationActions(context),
		...buildInstructionActions(context),
		...buildConfigActions(context),
		...buildReadActions(context),
		...buildProjectActions(context),
		...buildFileOpsActions(context),
		...buildHttpActions(context),
		...buildCommandActions(context),
		...buildAsyncTaskActions(context),
		...buildConnectionMailboxActions(context),
		...buildScanWorkerActions(context),
		...buildStaticServerActions(context),
		...buildIsolatedActions(context),
		...buildWriteActions(context),
		...buildWorkflowActions(context, buildActions),
		...buildPreviewActions(context),
		...buildShareActions(context),
		...buildRemoteDriveActions(context),
		...buildPreviewReceiptActions(context),
		...buildFakeSshActions(context),
		...buildRemoteNativeDesktopActions(context),
		...buildVirtualOsGraphActions(context),
		...buildRuntimeActions(context),
		...buildNodeDomActions(context),
		...buildOsSurfaceActions(context),
		...buildCognitionActions(context),
		...buildPortActions(context),
		...buildQualityActions(context, buildActions),
		...buildBatchAliasActions(context, buildActions),
		...buildActionHistoryActions(context, buildActions),
		...buildActionStreamActions(context),
		...buildTaskRuntimeActions(context)
	};
}

module.exports = { buildFoundationActions };
