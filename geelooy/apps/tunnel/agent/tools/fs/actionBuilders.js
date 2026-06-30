// B"H
const { buildConfigActions } = require('./actionGroups/configActions.js');
const { buildReadActions } = require('./actionGroups/readActions.js');
const { buildProjectActions } = require('./actionGroups/projectActions.js');
const { buildWriteActions } = require('./actionGroups/writeActions.js');
const { buildFileOpsActions } = require('./actionGroups/fileOpsActions.js');
const { buildHttpActions } = require('./actionGroups/httpActionsGroup.js');
const { buildCommandActions } = require('./actionGroups/commandActions.js');
const { buildAsyncTaskActions } = require('./actionGroups/asyncTaskActions.js');
const { buildStaticServerActions } = require('./actionGroups/staticServerActions.js');
const { buildIsolatedActions } = require('./actionGroups/isolatedActions.js');
const { buildWorkflowActions } = require('./actionGroups/workflowActions.js');
const { buildPreviewActions } = require('./actionGroups/previewActions.js');
const { buildShareActions } = require('./actionGroups/shareActions.js');
const { buildRemoteDriveActions } = require('./actionGroups/remoteDriveActions.js');
const { buildPreviewReceiptActions } = require('./actionGroups/previewReceiptActions.js');
const { buildFakeSshActions } = require('./actionGroups/fakeSshActions.js');
const { buildRemoteNativeDesktopActions } = require('./actionGroups/remoteNativeDesktopActions.js');
const { buildVirtualOsGraphActions } = require('./actionGroups/virtualOsGraphActions.js');
const { buildRuntimeActions } = require('./actionGroups/runtimeActions.js');
const { buildCognitionActions } = require('./actionGroups/cognitionActions.js');
const { buildQualityActions } = require('./actionGroups/qualityActions.js');
const { buildBatchAliasActions } = require('./actionGroups/batchAliasActions.js');
const { buildActionHistoryActions } = require('./actionGroups/actionHistoryActions.js');
const { buildMissionActions } = require('./actionGroups/missionActions.js');
const { buildMissionOperatingActions } = require('./actionGroups/missionOperatingActions.js');
const { buildMissionAwareActions } = require('./actionGroups/missionAwareActions.js');
const { buildMissionEightStepActions } = require('./actionGroups/missionEightStepActions.js');
const { buildMissionDaemonActions } = require('./actionGroups/missionDaemonActions.js');
const { buildMissionWatchdogActions } = require('./actionGroups/missionWatchdogActions.js');
const { buildMissionBootActions } = require('./actionGroups/missionBootActions.js');
const { buildMissionMetaActions } = require('./actionGroups/missionMetaActions.js');
const { buildMissionImprovementActions } = require('./actionGroups/missionImprovementActions.js');
const { buildContinuationActions } = require('./actionGroups/continuationActions.js');
const { buildChromeActions } = require('./actionGroups/chromeActions.js');
const { buildRemoteDesktopActions } = require('./actionGroups/remoteDesktopActions.js');
const { wrapActions } = require('./mission/missionAware/wrap.js');
function payloadEcho(payload) { return { BH:'B"H', ok:true, action:'payloadEcho', payload }; }
function actionSchemaTrace(payload) { return { BH:'B"H', ok:true, action:'actionSchemaTrace', requestedAction:payload.action, adapterAction:payload.adapterAction || null, actionRecoveredFromCarrier:!!payload.actionRecoveredFromCarrier, kind:payload.kind, keys:Object.keys(payload).sort() }; }
function addCommandAliases(actions) { if (actions.commandRun && !actions.command) actions.command = actions.commandRun; if (actions.commandStart && !actions.commandRun) actions.commandRun = actions.commandStart; if (actions.commandStart && !actions.command) actions.command = actions.commandStart; return actions; }
function buildActions(config, payload, ws, version) {
  const ctx = { config, payload, ws, version };
  const actions = addCommandAliases({ ...buildConfigActions(ctx), ...buildReadActions(ctx), ...buildProjectActions(ctx), ...buildFileOpsActions(ctx), ...buildHttpActions(ctx), ...buildCommandActions(ctx), ...buildAsyncTaskActions(ctx), ...buildStaticServerActions(ctx), ...buildIsolatedActions(ctx), ...buildWriteActions(ctx), ...buildWorkflowActions(ctx, buildActions), ...buildPreviewActions(ctx), ...buildShareActions(ctx), ...buildRemoteDriveActions(ctx), ...buildPreviewReceiptActions(ctx), ...buildFakeSshActions(ctx), ...buildRemoteNativeDesktopActions(ctx), ...buildVirtualOsGraphActions(ctx), ...buildRuntimeActions(ctx), ...buildCognitionActions(ctx), ...buildQualityActions(ctx, buildActions), ...buildBatchAliasActions(ctx, buildActions), ...buildActionHistoryActions(ctx, buildActions), ...buildMissionActions(ctx), ...buildMissionOperatingActions(ctx), ...buildMissionAwareActions(ctx), ...buildMissionEightStepActions(ctx), ...buildMissionDaemonActions(ctx, buildActions), ...buildMissionWatchdogActions(ctx, buildActions), ...buildMissionBootActions(ctx, buildActions), ...buildMissionMetaActions(ctx), ...buildMissionImprovementActions(ctx), ...buildContinuationActions(ctx, buildActions), ...buildChromeActions(ctx), ...buildRemoteDesktopActions(ctx), payloadEcho: async () => payloadEcho(payload), actionSchemaTrace: async () => actionSchemaTrace(payload) });
  return wrapActions(actions, config, payload);
}
/**
 * B"H
 * The garden gate now stamps each traveler when a missionId rides with it.
 * Ordinary actions no longer drift outside the graph; they leave receipts.
 */
module.exports = { buildActions };
