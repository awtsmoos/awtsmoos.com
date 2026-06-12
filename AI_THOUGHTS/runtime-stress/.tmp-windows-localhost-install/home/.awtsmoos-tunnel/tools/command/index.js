// B"H
const { loadConfig } = require("../../lib/config.js");
const { runCommand } = require("./run.js");
const { runNodeScript } = require("./scriptSandbox.js");
const { nodeCheck, nodeCheckTree } = require("./projectChecks.js");
const { instantTests } = require("./instantTests.js");

const COMMAND_RUN_ALIASES = ["command", "commandRun", "runCommand", "shell"];
const NODE_SCRIPT_ALIASES = ["nodeScript", "nodeScriptRun", "nodeRun"];

/**
 * B"H
 * Chapter 1: The Awtsmoos placed many mouths on one command flame.
 *
 * ChatGPT, humans, and older manifests may call the native command vessel by
 * slightly different names. This map keeps all those names flowing into the
 * same guarded runner, so the shell does not fracture into false doors.
 *
 * @param {Function} fn Native command runner.
 * @param {string[]} names Public aliases.
 * @returns {Object<string, Function>} Alias map entries.
 */
function aliases(fn, names) {
  return Object.fromEntries(names.map(name => [name, fn]));
}

const ACTIONS = {
  ...aliases((config, payload) => runCommand(config, payload), COMMAND_RUN_ALIASES),
  ...aliases((config, payload) => runNodeScript(config, payload), NODE_SCRIPT_ALIASES),
  nodeCheck: (config, payload) => nodeCheck(config, payload),
  nodeCheckFile: (config, payload) => nodeCheck(config, payload),
  nodeCheckTree: (config, payload) => nodeCheckTree(config, payload),
  instantTests: (config, payload) => instantTests(config, payload),
  nodeInstantTests: (config, payload) => instantTests(config, payload)
};

/**
 * B"H
 * Routes command-class actions by map, not maze.
 *
 * @param {object} payload Command payload.
 * @returns {Promise<object>} Command result.
 */
async function handleCommand(payload = {}) {
  const config = loadConfig();
  const action = payload.action || "commandRun";
  const fn = ACTIONS[action];

  if (fn) return await fn(config, { ...payload, action });

  return {
    ok: false,
    action,
    error: "unknown_command_action",
    availableActions: Object.keys(ACTIONS)
  };
}

module.exports = { handleCommand, ACTIONS };
