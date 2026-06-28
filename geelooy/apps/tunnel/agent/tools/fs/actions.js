// B"H
const { loadConfig } = require('../../lib/config.js');
const { buildConfigActions, publicConfig } = require('./actionGroups/configActions.js');
const { buildReadActions } = require('./actionGroups/readActions.js');
const { buildProjectActions } = require('./actionGroups/projectActions.js');
const { buildWriteActions } = require('./actionGroups/writeActions.js');
const { buildFileOpsActions } = require('./actionGroups/fileOpsActions.js');
const { buildHttpActions } = require('./actionGroups/httpActionsGroup.js');
const { buildCommandActions } = require('./actionGroups/commandActions.js');
const { buildStaticServerActions } = require('./actionGroups/staticServerActions.js');
const { buildIsolatedActions } = require('./actionGroups/isolatedActions.js');
const { buildWorkflowActions } = require('./actionGroups/workflowActions.js');
const { buildPreviewActions } = require('./actionGroups/previewActions.js');
const { buildRuntimeActions } = require('./actionGroups/runtimeActions.js');
const { buildCognitionActions } = require('./actionGroups/cognitionActions.js');
const { buildQualityActions } = require('./actionGroups/qualityActions.js');
const { buildBatchAliasActions } = require('./actionGroups/batchAliasActions.js');
const { buildActionHistoryActions } = require('./actionGroups/actionHistoryActions.js');
const { buildMissionActions } = require('./actionGroups/missionActions.js');
const { buildMissionEightStepActions } = require('./actionGroups/missionEightStepActions.js');
const { buildMissionDaemonActions } = require('./actionGroups/missionDaemonActions.js');
const { buildMissionWatchdogActions } = require('./actionGroups/missionWatchdogActions.js');
const { buildMissionBootActions } = require('./actionGroups/missionBootActions.js');
const { buildMissionMetaActions } = require('./actionGroups/missionMetaActions.js');
const { buildContinuationActions } = require('./actionGroups/continuationActions.js');
const { buildChromeActions } = require('./actionGroups/chromeActions.js');
const { buildRemoteDesktopActions } = require('./actionGroups/remoteDesktopActions.js');
const Payload = require('./actionGroups/missionActionPayload.js'); const ActiveGuard = require('./mission/activeGuard/index.js'); const Focus = require('./mission/response/compact.js'); const Lock = require('./mission/lock/index.js'); const Court = require('./mission/releaseCourt/index.js'); const Receipts = require('./mission/toolReceipts/index.js'); const Firewall = require('./mission/firewall/index.js'); const Final = require('./mission/finalInterceptor/index.js'); const StopAudit = require('./mission/stopAudit/index.js');
const AGENT_VERSION = 'split-agent-2.0.0';
function payloadEcho(payload) { return { BH:'B"H', ok:true, action:'payloadEcho', payload }; }
function actionSchemaTrace(payload) { return { BH:'B"H', ok:true, action:'actionSchemaTrace', requestedAction:payload.action, adapterAction:payload.adapterAction||null, actionRecoveredFromCarrier:!!payload.actionRecoveredFromCarrier, kind:payload.kind, keys:Object.keys(payload).sort() }; }
function buildActions(config, payload, ws) { const ctx = { config, payload, ws, version:AGENT_VERSION }; const actions = { ...buildConfigActions(ctx), ...buildReadActions(ctx), ...buildProjectActions(ctx), ...buildFileOpsActions(ctx), ...buildHttpActions(ctx), ...buildCommandActions(ctx), ...buildStaticServerActions(ctx), ...buildIsolatedActions(ctx), ...buildWriteActions(ctx), ...buildWorkflowActions(ctx, buildActions), ...buildPreviewActions(ctx), ...buildRuntimeActions(ctx), ...buildCognitionActions(ctx), ...buildQualityActions(ctx, buildActions), ...buildBatchAliasActions(ctx, buildActions), ...buildActionHistoryActions(ctx, buildActions), ...buildMissionActions(ctx), ...buildMissionEightStepActions(ctx), ...buildMissionDaemonActions(ctx, buildActions), ...buildMissionWatchdogActions(ctx, buildActions), ...buildMissionBootActions(ctx, buildActions), ...buildMissionMetaActions(ctx), ...buildContinuationActions(ctx, buildActions), ...buildChromeActions(ctx), ...buildRemoteDesktopActions(ctx), payloadEcho:async()=>payloadEcho(payload), actionSchemaTrace:async()=>actionSchemaTrace(payload) }; if(actions.commandRun&&!actions.command)actions.command=actions.commandRun; if(actions.commandStart&&!actions.commandRun)actions.commandRun=actions.commandStart; if(actions.commandStart&&!actions.command)actions.command=actions.commandStart; return actions; }
async function handleFsAction(rawPayload, ws) { const config = loadConfig(); const payload = Payload.mergedPayload(rawPayload || {}); const action = payload.action; if (!action) return { ok:false, status:400, error:'missing_action' }; const active = Lock.active(config); if (active) { const fw = Firewall.check(config, action, active, payload); if (!fw.ok) return Focus.compact({ ok:false, action, ...fw, finalAnswerAllowed:false, mustContinue:true, mustCallNext:active.lastMustCallNext }, payload); } const block = await ActiveGuard.check(config, payload); if (block) return Focus.compact(block, payload); const actions = buildActions(config, payload, ws); const fn = actions[action]; if (!fn) return { ok:false, status:400, action, error:'Unknown fs action: '+action, availableActions:Object.keys(actions).sort() }; let result = await fn(); if (!result || typeof result !== 'object') return { ok:false, status:502, action, error:'empty_action_response' }; if (!result.action) result.action = action; const beforeLock = Lock.active(config); result = Court.guard(config, beforeLock, result, payload); result = Final.intercept(beforeLock, result); const stopAudit = StopAudit.after(config, beforeLock, result); const lock = Lock.after(config, payload, result); const receipt = Receipts.after(config, payload, result); if (lock && String(result.action || '').startsWith('mission')) result.releaseStatus = lock.releaseStatus || 'locked'; if (receipt) result.missionToolReceipt = receipt; if (stopAudit) result.stopAudit = stopAudit; return Focus.compact(result, payload); }
function publicConfigWithVersion(config) { return publicConfig(config, AGENT_VERSION); }
module.exports = { handleFsAction, publicConfig: publicConfigWithVersion, buildActions, AGENT_VERSION };
