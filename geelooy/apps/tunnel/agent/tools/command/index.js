// B"H
const { loadConfig } = require('../../lib/config.js');
const { runCommand } = require('./run.js');
const { runNodeScript } = require('./scriptSandbox.js');
const { nodeCheck, nodeCheckTree } = require('./projectChecks.js');
const { instantTests } = require('./instantTests.js');
const {
  startCommandJob,
  commandStatus,
  commandWait,
  commandJobOutputPage,
  cancelCommandJob
} = require('../fs/commandJobStore.js');
const MissionWrap = require('./missionWrap.js');

const COMMAND_RUN_ALIASES = ['command', 'commandRun', 'runCommand', 'shell'];
const NODE_SCRIPT_ALIASES = ['nodeScript', 'nodeScriptRun', 'nodeRun'];
const READ_ONLY = new Set([
  'commandStatus', 'commandPoll', 'commandJobStatus', 'jobStatus',
  'commandWait', 'commandJobWait', 'waitForJob', 'jobWait',
  'commandJobOutputPage', 'commandOutputPage'
]);

/**
 * B"H
 * Chapter of the unbroken receipt: the Awtsmoos gives many doorways into one
 * command chamber, but the response must leave through the same doorway by
 * which the caller entered. A canonical worker may serve the request; it may
 * not steal the caller's identity and make correlation think the answer belongs
 * to another waiting soul.
 */
function aliases(fn, names, canonicalAction = '') {
  return Object.fromEntries(names.map(name => [name, (config, payload) => {
    const canonical = canonicalAction || name;
    if (name === canonical) return fn(config, mark(payload, name, canonical));
    return runAlias(fn, config, payload, name, canonical);
  }]));
}

const ACTIONS = {
  ...aliases((config, payload) => runCommand(config, payload), COMMAND_RUN_ALIASES, 'commandRun'),
  ...aliases((config, payload) => runNodeScript(config, payload), NODE_SCRIPT_ALIASES, 'nodeScript'),
  ...aliases((config, payload) => startCommandJob(config, payload), ['commandStart', 'commandJobStart', 'commandAsync', 'jobStart'], 'commandStart'),
  ...aliases((config, payload) => commandStatus(config, payload), ['commandStatus', 'commandPoll', 'commandJobStatus', 'jobStatus'], 'commandStatus'),
  ...aliases((config, payload) => commandWait(config, payload), ['commandWait', 'commandJobWait', 'waitForJob', 'jobWait'], 'commandWait'),
  ...aliases((config, payload) => commandJobOutputPage(config, payload), ['commandJobOutputPage', 'commandOutputPage'], 'commandJobOutputPage'),
  ...aliases((config, payload) => cancelCommandJob(config, payload), ['commandCancel', 'commandJobCancel'], 'commandCancel'),
  nodeCheck: (config, payload) => nodeCheck(config, payload),
  nodeCheckFile: (config, payload) => nodeCheck(config, payload),
  nodeCheckTree: (config, payload) => nodeCheckTree(config, payload),
  instantTests: (config, payload) => instantTests(config, payload),
  nodeInstantTests: (config, payload) => instantTests(config, payload)
};

async function handleCommand(payload = {}) {
  const config = loadConfig();
  const action = payload.action || 'commandRun';
  const fn = ACTIONS[action];
  if (!fn) return { ok: false, action, error: 'unknown_command_action', availableActions: Object.keys(ACTIONS) };
  const nextPayload = { ...payload, action, requestAction: payload.requestAction || action };
  if (READ_ONLY.has(action) || nextPayload.noMission === true || nextPayload.missionless === true) return await fn(config, nextPayload);
  return MissionWrap.run(config, nextPayload, fn);
}

async function runAlias(fn, config, payload = {}, requestedAction, canonicalAction) {
  const result = await fn(config, mark(payload, requestedAction, canonicalAction));
  return preserveAliasIdentity(result, requestedAction, canonicalAction);
}

function mark(payload = {}, requestedAction, canonicalAction) {
  return {
    ...payload,
    action: canonicalAction,
    requestAction: requestedAction,
    actualAction: canonicalAction
  };
}

function preserveAliasIdentity(result, requestedAction, canonicalAction) {
  const out = result && typeof result === 'object' ? { ...result } : { ok: false, error: 'empty_command_response' };
  return {
    ...out,
    action: requestedAction,
    requestAction: requestedAction,
    actualAction: requestedAction,
    canonicalAction,
    servedByAction: canonicalAction
  };
}

module.exports = { handleCommand, ACTIONS, READ_ONLY, preserveAliasIdentity };
