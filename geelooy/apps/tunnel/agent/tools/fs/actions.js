// B"H
const { loadConfig } = require('../../lib/config.js');
const { publicConfig } = require('./actionGroups/configActions.js');
const Payload = require('./actionGroups/missionActionPayload.js');
const { buildActions: makeActions } = require('./actionBuilders.js');
const ActiveGuard = require('./mission/activeGuard/index.js');
const Focus = require('./mission/response/compact.js');
const Lock = require('./mission/lock/index.js');
const Court = require('./mission/releaseCourt/index.js');
const Receipts = require('./mission/toolReceipts/index.js');
const Firewall = require('./mission/firewall/index.js');
const Final = require('./mission/finalInterceptor/index.js');
const StopAudit = require('./mission/stopAudit/index.js');
const Ledger = require('./actionLedger.js');
const Mission = require('./mission/index.js');
const AutoAsync = require('./autoAsync.js');

const AGENT_VERSION = 'split-agent-2.0.0';

function isFirewallStepAuthorized(firewallResult) {
  return !!firewallResult && firewallResult.ok === true && firewallResult.authorized === true && firewallResult.kind === 'missionNeedsStepAuthorization';
}
function buildActions(config, payload, ws) { return makeActions(config, payload, ws, AGENT_VERSION); }
function missingAction() { return { ok:false, status:400, error:'missing_action' }; }
function unknownAction(action, actions) { return { ok:false, status:400, action, error:'Unknown fs action: ' + action, availableActions:Object.keys(actions).sort() }; }
function firewallBlock(action, firewallResult, active, payload) { return Focus.compact({ ok:false, action, ...firewallResult, finalAnswerAllowed:false, mustContinue:true, mustCallNext:active.lastMustCallNext }, payload); }
async function recorded(config, payload, output) { return Ledger.record(config, payload, output, { historyBackend:'awtsmoosdb', deviceState:true, jsonl:false, gitRepoStorage:false }); }
async function healthyActive(config) {
  const active = Lock.active(config);
  if (!active?.missionId) return active;
  try { if (await Mission.load(config, active.missionId)) return active; } catch {}
  Lock.clear(config);
  return null;
}
async function runAction(action, actions) {
  const fn = actions[action];
  if (!fn) return unknownAction(action, actions);
  const result = await fn();
  if (!result || typeof result !== 'object') return { ok:false, status:502, action, error:'empty_action_response' };
  if (!result.action) result.action = action;
  return result;
}
function finishAction(config, payload, result) {
  const beforeLock = Lock.active(config);
  let output = Court.guard(config, beforeLock, result, payload);
  output = Final.intercept(beforeLock, output);
  const stopAudit = StopAudit.after(config, beforeLock, output);
  const lock = Lock.after(config, payload, output);
  const receipt = Receipts.after(config, payload, output);
  if (lock && String(output.action || '').startsWith('mission')) output.releaseStatus = lock.releaseStatus || 'locked';
  if (receipt) output.missionToolReceipt = receipt;
  if (stopAudit) output.stopAudit = stopAudit;
  return Focus.compact(output, payload);
}
async function maybeOffload(config, payload) {
  if (!AutoAsync.shouldOffload(payload.action, payload)) return null;
  return await AutoAsync.offload(config, payload);
}
async function handleFsAction(rawPayload, ws) {
  const config = loadConfig(), payload = Payload.mergedPayload(rawPayload || {}), action = payload.action;
  if (!action) return recorded(config, payload, missingAction());
  const offloaded = await maybeOffload(config, payload);
  if (offloaded) return recorded(config, payload, Focus.compact(offloaded, payload));
  const active = await healthyActive(config);
  let firewallResult = null;
  if (active) {
    firewallResult = Firewall.check(config, action, active, payload);
    if (!firewallResult.ok) return recorded(config, payload, firewallBlock(action, firewallResult, active, payload));
  }
  if (!isFirewallStepAuthorized(firewallResult)) {
    const block = await ActiveGuard.check(config, payload);
    if (block) return recorded(config, payload, Focus.compact(block, payload));
  }
  const actions = buildActions(config, payload, ws);
  return recorded(config, payload, finishAction(config, payload, await runAction(action, actions)));
}
function publicConfigWithVersion(config) { return publicConfig(config, AGENT_VERSION); }
module.exports = { handleFsAction, publicConfig:publicConfigWithVersion, buildActions, AGENT_VERSION, isFirewallStepAuthorized, healthyActive, maybeOffload };
