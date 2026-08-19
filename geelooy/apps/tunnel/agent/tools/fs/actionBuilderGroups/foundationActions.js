// B"H
// Boruch Hashem
// Blessed is He

const { buildConfigActions } = require("../actionGroups/configActions.js");
const { buildReadActions } = require("../actionGroups/readActions.js");
const { buildProjectActions } = require("../actionGroups/projectActions.js");
const { buildFileOpsActions } = require("../actionGroups/fileOpsActions.js");
const { buildHttpActions } = require("../actionGroups/httpActionsGroup.js");
const { buildCommandActions } = require("../actionGroups/commandActions.js");
const { buildAsyncTaskActions } = require("../actionGroups/asyncTaskActions.js");
const { buildConnectionMailboxActions } = require("../actionGroups/connectionMailboxActions.js");
const { buildScanWorkerActions } = require("../actionGroups/scanWorkerActions.js");
const { buildStaticServerActions } = require("../actionGroups/staticServerActions.js");
const { buildIsolatedActions } = require("../actionGroups/isolatedActions.js");
const { buildWriteActions } = require("../actionGroups/writeActions.js");
const { buildWorkflowActions } = require("../actionGroups/workflowActions.js");
const { buildPreviewActions } = require("../actionGroups/previewActions.js");
const { buildShareActions } = require("../actionGroups/shareActions.js");
const { buildRemoteDriveActions } = require("../actionGroups/remoteDriveActions.js");
const { buildPreviewReceiptActions } = require("../actionGroups/previewReceiptActions.js");
const { buildFakeSshActions } = require("../actionGroups/fakeSshActions.js");
const { buildRemoteNativeDesktopActions } = require("../actionGroups/remoteNativeDesktopActions.js");
const { buildVirtualOsGraphActions } = require("../actionGroups/virtualOsGraphActions.js");
const { buildRuntimeActions } = require("../actionGroups/runtimeActions.js");
const { buildNodeDomActions } = require("../actionGroups/nodeDomActions.js");
const { buildOsSurfaceActions } = require("../actionGroups/osSurfaceActions.js");
const { buildCognitionActions } = require("../actionGroups/cognitionActions.js");
const { buildPortActions } = require("../actionGroups/portActions.js");
const { buildQualityActions } = require("../actionGroups/qualityActions.js");
const { buildBatchAliasActions } = require("../actionGroups/batchAliasActions.js");
const { buildActionHistoryActions } = require("../actionGroups/actionHistoryActions.js");
const { buildActionStreamActions } = require("../actionGroups/actionStreamActions.js");
const { buildTaskRuntimeActions } = require("../actionGroups/taskRuntimeActions.js");

/**
 * @file Composes the foundational filesystem, command, runtime, and history action vessels.
 * @description
 * The Awtsmoos gives each foundation its own ordered gate, never a tangled wall;
 * Awtsmoos.com keeps precedence explicit so later rooms may stand without making earlier deeds fall.
 */
function buildFoundationActions(context, buildActions) {
	return {
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
