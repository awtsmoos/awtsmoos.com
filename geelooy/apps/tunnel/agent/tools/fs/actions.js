// B"H
const { loadConfig } = require('../../lib/config.js');
const { publicConfig } = require('./actionGroups/configActions.js');
const Payload = require('./actionGroups/missionActionPayload.js');
const { buildActions: makeActions } = require('./actionBuilders.js');
const ActiveGuard = require('./mission/activeGuard/index.js');
const Focus = require('./mission/response/compact.js');
const Firewall = require('./mission/firewall/index.js');
const Ledger = require('./actionLedger.js');
const Runtime = require('./actionRuntime.js');
const Finish = require('./actionFinish.js');
const ImplicitBoot = require('./mission/implicitBoot/index.js');
const AGENT_VERSION = 'split-agent-2.0.0';
function isFirewallStepAuthorized(firewallResult) { return !!firewallResult && firewallResult.ok === true && firewallResult.authorized === true && firewallResult.kind === 'missionNeedsStepAuthorization'; }
function buildActions(config, payload, ws) { return makeActions(config, payload, ws, AGENT_VERSION); }
async function recorded(config, payload, output) { return Ledger.record(config, payload, output, { historyBackend:'awtsmoosdb', deviceState:true, jsonl:false, gitRepoStorage:false }); }
async function guardActive(config, payload, active) {
  if (!active) return null;
  const firewallResult = Firewall.check(config, payload.action, active, payload);
  if (!firewallResult.ok) return Finish.firewallBlock(payload.action, firewallResult, active, payload);
  if (isFirewallStepAuthorized(firewallResult)) return null;
  return await ActiveGuard.check(config, payload);
}
async function prepareMission(config, payload) {
  const active = await Runtime.healthyActive(config);
  const boot = await ImplicitBoot.maybeStart(config, payload, active);
  return { active:boot?.lock || active, boot };
}
async function handleFsAction(rawPayload, ws) {
  const config = loadConfig(), payload = Payload.mergedPayload(rawPayload || {}), action = payload.action;
  if (!action) return recorded(config, payload, Runtime.missingAction());
  const mission = await prepareMission(config, payload);
  const offloaded = await Runtime.maybeOffload(config, payload);
  if (offloaded) return recorded(config, payload, Focus.compact(ImplicitBoot.annotate(offloaded, mission.boot), payload));
  const block = await guardActive(config, payload, mission.active);
  if (block) return recorded(config, payload, Focus.compact(ImplicitBoot.annotate(block, mission.boot), payload));
  const result = await Runtime.runAction(action, buildActions(config, payload, ws));
  return recorded(config, payload, ImplicitBoot.annotate(Finish.finishAction(config, payload, result), mission.boot));
}
function publicConfigWithVersion(config) { return publicConfig(config, AGENT_VERSION); }
module.exports = { handleFsAction, publicConfig:publicConfigWithVersion, buildActions, AGENT_VERSION, isFirewallStepAuthorized, healthyActive:Runtime.healthyActive, maybeOffload:Runtime.maybeOffload, prepareMission };
