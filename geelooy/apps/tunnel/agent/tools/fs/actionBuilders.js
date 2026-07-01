// B"H
const fs = require('fs');
const path = require('path');
const os = require('os');
const { ROOT } = require('../../lib/config.js');
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
const { buildMissionLedgerActions } = require('./actionGroups/missionLedgerActions.js');
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
function awtsmoosMyDevice(config, version) { return { ok:true, action:'awtsmoosMyDevice', tunnelName:config.tunnelName, deviceName:os.hostname(), root:config.root, allowWrite:config.allowWrite, allowSecrets:config.allowSecrets, allowCommands:config.allowCommands, agentVersion:version, vesselType:'native-local', targetVessel:'local-tunnel' }; }
function selfTest(version) { return { ok:true, action:'agentSelfTest', agentVersion:version, checks:['action_registry','identity_recovery_helper'], generatedAt:new Date().toISOString() }; }
function versionSkew(version) { return { ok:true, action:'agentVersionSkewCheck', agentVersion:version, installedVersion:version, skew:false }; }
function livenessTimeline(config) {
  const entries = logEvents();
  const latest = [...entries].reverse().find(e => e.event === 'memory') || {};
  const circuit = latest.circuit || { level:'unknown', advisoryOnly:null };
  const lag = latest.eventLoopLag || {};
  return {
    ok:true, action:'tunnelLivenessTimeline', requestAction:'tunnelLivenessTimeline', actualAction:'tunnelLivenessTimeline',
    tunnelName:config.tunnelName, state:stateFrom(circuit.level), isAlive:true,
    eventLoopLagMs:lag.lastMs ?? null, maxEventLoopLagMs:lag.maxMs ?? null,
    circuit, timeline:entries.slice(-20), fallbacks:['awtsmoos-virtual-os','awtsmoos-code'],
    recommendedNext:recommend(circuit.level)
  };
}
function logEvents() {
  const file = path.join(ROOT, 'agent.log');
  let text = '';
  try {
    const stat = fs.statSync(file);
    const fd = fs.openSync(file, 'r');
    const size = Math.min(stat.size, 128 * 1024), buf = Buffer.alloc(size);
    fs.readSync(fd, buf, 0, size, Math.max(0, stat.size - size));
    fs.closeSync(fd);
    text = buf.toString('utf8');
  } catch { return []; }
  return text.split(/\n/).map(parseLogLine).filter(Boolean);
}
function parseLogLine(line) {
  const at = (line.match(/^\[([^\]]+)\]/) || [])[1] || '';
  if (!at) return null;
  if (line.includes('Tunnel registered ready')) return { at, event:'registered', ok:true };
  if (line.includes('Tunnel watchdog reconnect')) return { at, event:'watchdog_reconnect', ok:false, ...jsonTail(line) };
  if (line.includes('Memory:')) return { at, event:'memory', ok:true, ...jsonTail(line) };
  return null;
}
function jsonTail(line) { try { return JSON.parse(line.slice(line.indexOf('{'))); } catch { return {}; } }
function stateFrom(level) { if (level === 'panic') return 'lagging'; if (level === 'hard') return 'lagging'; if (level === 'soft') return 'degraded'; if (level === 'open') return 'alive'; return 'unknown'; }
function recommend(level) { return level === 'panic' || level === 'hard' ? 'control_actions_only_until_lag_drops' : 'normal_actions_allowed'; }
function addCommandAliases(actions) { if (actions.commandRun && !actions.command) actions.command = actions.commandRun; if (actions.commandStart && !actions.commandRun) actions.commandRun = actions.commandStart; if (actions.commandStart && !actions.command) actions.command = actions.commandStart; return actions; }
function buildActions(config, payload, ws, version) {
  const ctx = { config, payload, ws, version };
  const actions = addCommandAliases({ ...buildConfigActions(ctx), ...buildReadActions(ctx), ...buildProjectActions(ctx), ...buildFileOpsActions(ctx), ...buildHttpActions(ctx), ...buildCommandActions(ctx), ...buildAsyncTaskActions(ctx), ...buildStaticServerActions(ctx), ...buildIsolatedActions(ctx), ...buildWriteActions(ctx), ...buildWorkflowActions(ctx, buildActions), ...buildPreviewActions(ctx), ...buildShareActions(ctx), ...buildRemoteDriveActions(ctx), ...buildPreviewReceiptActions(ctx), ...buildFakeSshActions(ctx), ...buildRemoteNativeDesktopActions(ctx), ...buildVirtualOsGraphActions(ctx), ...buildRuntimeActions(ctx), ...buildCognitionActions(ctx), ...buildQualityActions(ctx, buildActions), ...buildBatchAliasActions(ctx, buildActions), ...buildActionHistoryActions(ctx, buildActions), ...buildMissionActions(ctx), ...buildMissionLedgerActions(ctx), ...buildMissionOperatingActions(ctx), ...buildMissionAwareActions(ctx), ...buildMissionEightStepActions(ctx), ...buildMissionDaemonActions(ctx, buildActions), ...buildMissionWatchdogActions(ctx, buildActions), ...buildMissionBootActions(ctx, buildActions), ...buildMissionMetaActions(ctx), ...buildMissionImprovementActions(ctx), ...buildContinuationActions(ctx, buildActions), ...buildChromeActions(ctx), ...buildRemoteDesktopActions(ctx), payloadEcho: async () => payloadEcho(payload), actionSchemaTrace: async () => actionSchemaTrace(payload), awtsmoosMyDevice: async () => awtsmoosMyDevice(config, version), agentSelfTest: async () => selfTest(version), agentVersionSkewCheck: async () => versionSkew(version), tunnelLivenessTimeline: async () => livenessTimeline(config) });
  return wrapActions(actions, config, payload);
}
module.exports = { buildActions, livenessTimeline };
