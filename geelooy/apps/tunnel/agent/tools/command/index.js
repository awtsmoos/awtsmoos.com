// B"H
const { loadConfig } = require('../../lib/config.js');
const { runCommand } = require('./run.js');
const { runNodeScript } = require('./scriptSandbox.js');
const { nodeCheck, nodeCheckTree } = require('./projectChecks.js');
const { instantTests } = require('./instantTests.js');
const { startCommandJob, commandStatus, commandWait, commandJobOutputPage, cancelCommandJob } = require('../fs/commandJobStore.js');
const MissionWrap = require('./missionWrap.js');
const COMMAND_RUN_ALIASES = ['command', 'commandRun', 'runCommand', 'shell'];
const NODE_SCRIPT_ALIASES = ['nodeScript', 'nodeScriptRun', 'nodeRun'];
const READ_ONLY = new Set(['commandStatus','commandPoll','commandJobStatus','jobStatus','commandWait','commandJobWait','waitForJob','jobWait','commandJobOutputPage','commandOutputPage']);
function aliases(fn, names) { return Object.fromEntries(names.map(name => [name, fn])); }
const ACTIONS = {
  ...aliases((config, payload) => runCommand(config, payload), COMMAND_RUN_ALIASES),
  ...aliases((config, payload) => runNodeScript(config, payload), NODE_SCRIPT_ALIASES),
  ...aliases((config, payload) => startCommandJob(config, payload), ['commandStart', 'commandJobStart', 'commandAsync', 'jobStart']),
  ...aliases((config, payload) => commandStatus(config, payload), ['commandStatus', 'commandPoll', 'commandJobStatus', 'jobStatus']),
  ...aliases((config, payload) => commandWait(config, payload), ['commandWait', 'commandJobWait', 'waitForJob', 'jobWait']),
  ...aliases((config, payload) => commandJobOutputPage(config, payload), ['commandJobOutputPage','commandOutputPage']),
  ...aliases((config, payload) => cancelCommandJob(config, payload), ['commandCancel', 'commandJobCancel']),
  nodeCheck:(config, payload) => nodeCheck(config, payload), nodeCheckFile:(config, payload) => nodeCheck(config, payload),
  nodeCheckTree:(config, payload) => nodeCheckTree(config, payload), instantTests:(config, payload) => instantTests(config, payload),
  nodeInstantTests:(config, payload) => instantTests(config, payload)
};
async function handleCommand(payload = {}) {
  const config = loadConfig(), action = payload.action || 'commandRun', fn = ACTIONS[action];
  if (!fn) return { ok:false, action, error:'unknown_command_action', availableActions:Object.keys(ACTIONS) };
  const nextPayload = { ...payload, action };
  if (READ_ONLY.has(action) || nextPayload.noMission === true || nextPayload.missionless === true) return await fn(config, nextPayload);
  return MissionWrap.run(config, nextPayload, fn);
}
/** B"H — Command vessel now shares the same implicit mission discipline. */
module.exports = { handleCommand, ACTIONS, READ_ONLY };
