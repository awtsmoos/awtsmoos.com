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
const Recovery = require('../../lib/runtime/recovery-envelope.js');
const AGENT_VERSION = 'split-agent-2.0.0';
function isFirewallStepAuthorized(firewallResult) { return !!firewallResult && firewallResult.ok === true && firewallResult.authorized === true && firewallResult.kind === 'missionNeedsStepAuthorization'; }
function buildActions(config, payload, ws) { return makeActions(config, payload, ws, AGENT_VERSION); }
async function recorded(config, payload, output) { return Ledger.record(config, payload, output, { historyBackend:'awtsmoosdb', deviceState:true, jsonl:false, gitRepoStorage:false }); }
function missionManaged(payload = {}) {
  const action = String(payload.action || '');
  if (action.startsWith('mission') || action.startsWith('actionHistory')) return true;
  if (payload.missionId || payload.parentMissionId || payload.missionMode === true || payload.missionMode === 'true') return true;
  if (payload.forceMission === true || payload.forceMission === 'true') return true;
  if (payload.implicitMission === true || payload.implicitMission === 'true') return true;
  return false;
}
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
async function runPlain(config, payload, ws) {
  const actions = buildActions(config, payload, ws);
  const offloaded = await Runtime.maybeOffload(config, payload);
  if (offloaded) return recorded(config, payload, offloaded);
  const result = await Runtime.runAction(payload.action, actions);
  return recorded(config, payload, result);
}
async function runMissionManaged(config, payload, ws) {
  const mission = await prepareMission(config, payload);
  const offloaded = await Runtime.maybeOffload(config, payload);
  if (offloaded) return recorded(config, payload, Focus.compact(ImplicitBoot.annotate(offloaded, mission.boot), payload));
  const block = await guardActive(config, payload, mission.active);
  if (block) return recorded(config, payload, Focus.compact(ImplicitBoot.annotate(block, mission.boot), payload));
  const result = await Runtime.runAction(payload.action, buildActions(config, payload, ws));
  return recorded(config, payload, ImplicitBoot.annotate(Finish.finishAction(config, payload, result), mission.boot));
}
async function handleFsAction(rawPayload, ws) {
  const config = loadConfig(), payload = Payload.mergedPayload(rawPayload || {}), action = payload.action;
  if (!payload.normalized || !action || action === 'unknown') return recorded(config, payload, Recovery.missingActionEnvelope(rawPayload || payload));
  return missionManaged(payload) ? runMissionManaged(config, payload, ws) : runPlain(config, payload, ws);
}
function publicConfigWithVersion(config) { return publicConfig(config, AGENT_VERSION); }
module.exports = { handleFsAction, publicConfig:publicConfigWithVersion, buildActions, AGENT_VERSION, isFirewallStepAuthorized, healthyActive:Runtime.healthyActive, maybeOffload:Runtime.maybeOffload, prepareMission, missionManaged, runPlain, runMissionManaged };
/**
 * B"H
 * Ordinary filesystem/command/browser actions are no longer swallowed by an
 * active mission. Missions must be explicit. The Awtsmoos lets the file speak
 * as a file, and the mission as a mission.
 */
