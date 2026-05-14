
// B"H
const { loadConfig } = require("../../lib/config.js");
const { runCommand } = require("./run.js");
const { runNodeScript } = require("./scriptSandbox.js");

async function handleCommand(payload = {}) {
  const config = loadConfig();

  if (payload.action === "commandRun") {
    return await runCommand(config, payload);
  }

  if (payload.action === "nodeScriptRun") {
    return await runNodeScript(config, payload);
  }

  return {
    ok: false,
    action: payload.action,
    error: "unknown_command_action"
  };
}

module.exports = { handleCommand };
