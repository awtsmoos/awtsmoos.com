// B"H
const { loadConfig } = require("../../lib/config.js");
const { runCommand } = require("./run.js");
const { runNodeScript } = require("./scriptSandbox.js");
const { nodeCheck, nodeCheckTree } = require("./projectChecks.js");
const { instantTests } = require("./instantTests.js");
const {
  startCommandJob,
  commandStatus,
  commandJobOutputPage,
  cancelCommandJob
} = require("../fs/commandJobStore.js");

const COMMAND_RUN_ALIASES = ["command", "commandRun", "runCommand", "shell"];
const NODE_SCRIPT_ALIASES = ["nodeScript", "nodeScriptRun", "nodeRun"];

/**
 * B"H
 * Chapter 477: The command vessel and the filesystem vessel stopped arguing.
 * The public action surface promised commandStart/status/output/cancel, but the
 * top-level command router only knew commandRun. Now both rivers reach the same
 * job store, so large output can page instead of crashing at the gateway.
 */
function aliases(fn, names) {
  return Object.fromEntries(names.map(name => [name, fn]));
}

const ACTIONS = {
  ...aliases((config, payload) => runCommand(config, payload), COMMAND_RUN_ALIASES),
  ...aliases((config, payload) => runNodeScript(config, payload), NODE_SCRIPT_ALIASES),
  ...aliases((config, payload) => startCommandJob(config, payload), ["commandStart", "commandJobStart", "commandAsync"]),
  ...aliases((config, payload) => commandStatus(config, payload), ["commandStatus", "commandPoll", "commandJobStatus"]),
  ...aliases((config, payload) => commandJobOutputPage(config, payload), ["commandJobOutputPage"]),
  ...aliases((config, payload) => commandJobOutputPage(config, payload), ["commandOutputPage"]),
  ...aliases((config, payload) => cancelCommandJob(config, payload), ["commandCancel", "commandJobCancel"]),
  nodeCheck: (config, payload) => nodeCheck(config, payload),
  nodeCheckFile: (config, payload) => nodeCheck(config, payload),
  nodeCheckTree: (config, payload) => nodeCheckTree(config, payload),
  instantTests: (config, payload) => instantTests(config, payload),
  nodeInstantTests: (config, payload) => instantTests(config, payload)
};

async function handleCommand(payload = {}) {
  const config = loadConfig();
  const action = payload.action || "commandRun";
  const fn = ACTIONS[action];
  if (fn) return await fn(config, { ...payload, action });
  return { ok: false, action, error: "unknown_command_action", availableActions: Object.keys(ACTIONS) };
}

module.exports = { handleCommand, ACTIONS };
