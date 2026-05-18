// B"H
const { loadConfig } = require("../../lib/config.js");
const { runCommand } = require("./run.js");
const { runNodeScript } = require("./scriptSandbox.js");
const { nodeCheck, nodeCheckTree } = require("./projectChecks.js");
const { instantTests } = require("./instantTests.js");

const ACTIONS = {
  commandRun: (config, payload) => runCommand(config, payload),
  nodeScriptRun: (config, payload) => runNodeScript(config, payload),
  nodeCheck: (config, payload) => nodeCheck(config, payload),
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
  const fn = ACTIONS[payload.action];

  if (fn) return await fn(config, payload);

  return {
    ok: false,
    action: payload.action,
    error: "unknown_command_action",
    availableActions: Object.keys(ACTIONS)
  };
}

module.exports = { handleCommand };
