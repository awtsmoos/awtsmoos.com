// B"H
const path = require('path');
const { start } = require('./actionGroups/asyncTaskActions.js');
const Identity = require('../../lib/runtime/processIdentity.js');

/**
 * B"H
 * Chapter 1904: The caller spoke the old name, and the kernel secretly gave it wings.
 * Each room/agent now gets its own process identity stamp by default.
 */
const HEAVY_ACTIONS = new Set([
  'bulk', 'bulkWrite', 'bulkWriteIfHashes', 'actionBatch', 'parallelActionBatch', 'forEachActionBatch',
  'previewCreate', 'previewCollection', 'previewPage', 'previewFolder', 'previewLiveCommand', 'previewActionResult',
  'runtimeWorkflow', 'workflowRun', 'workflowValidate', 'workflowStepLinter',
  'missionAuto', 'missionAutopilot', 'missionContinueOneHour', 'missionContinueUntilGate', 'missionDaemonTick', 'missionDaemonRecover', 'missionExecuteNext8', 'missionLoopPulse', 'missionLoopQueue', 'missionRoomLoopPulse', 'missionRoomSchedulerRun', 'missionSelfImproveRunBounded', 'missionSelfImproveSchedulerRun',
  'chromeScreenshot', 'chromeReplay', 'browserReplay', 'chromeRunScript', 'chromeEval', 'chromeEvalSlim',
  'isolatedHtmlTest', 'isolatedJsTest', 'isolatedNodeCheck', 'testRunner', 'testMatrixRunner', 'stressTest', 'agentSelfTest'
]);
function truthy(v) { return v === true || v === 1 || ['true', '1', 'yes', 'on'].includes(String(v).toLowerCase()); }
function childMode() { return process.env.AWTSMOOS_ASYNC_CHILD === '1'; }
function inlineOverrideAllowed() { return process.env.AWTSMOOS_ALLOW_INLINE_HEAVY === '1'; }
function syncRequested(payload = {}) {
  if (childMode()) return true;
  return inlineOverrideAllowed() && (
    truthy(payload.sync) || truthy(payload.inline) ||
    truthy(payload.blocking) || truthy(payload.noAutoAsync)
  );
}
function shouldOffload(action, payload = {}) {
	if (!action || childMode()) return false;
	if (HEAVY_ACTIONS.has(String(action))) return !syncRequested(payload);
	if (truthy(payload.autoAsync)) return true;
	return false;
}
async function offload(config, payload = {}) {
  const action = String(payload.action || 'unknown');
  const child = path.resolve(__dirname, '../../scripts/run-fs-action-child.cjs');
  const identity = Identity.fromPayload(payload);
  const encoded = Buffer.from(JSON.stringify({ ...payload, sync:true, noAutoAsync:true, processIdentity:identity }), 'utf8').toString('base64');
  const receipt = await start(config, {
    action:'asyncTaskStart',
    command:process.execPath,
    args:[child, encoded],
    cwd:config.root || process.cwd(),
    timeoutMs:payload.timeoutMs || 600000,
    maxOutput:payload.maxOutput || 400000,
    allowCommands:true,
    processIdentity:identity,
    env:Identity.env(identity)
  });
  return {
    ...receipt,
    ok:true,
    action,
    originalAction:action,
    mode:'auto_async_subprocess',
    autoAsync:true,
    processIdentity:identity,
    osLinks:Identity.osLinks(identity),
    message:`${action} is running in an isolated subprocess for ${identity.processLabel}. Use wait/status/output payloads.`,
    childResultHint:'stdout contains one JSON object when the child completes.'
  };
}
module.exports = { HEAVY_ACTIONS, childMode, inlineOverrideAllowed, shouldOffload, offload, syncRequested };
