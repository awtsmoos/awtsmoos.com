
// B"H
const { loadConfig } = require("../../lib/config.js");
const { runCommand } = require("./run.js");

async function handleCommand(payload = {}) {
  const config = loadConfig();

  if (payload.action === "commandRun") {
    return await runCommand(config, payload);
  }

  return {
    ok: false,
    action: payload.action,
    error: "unknown_command_action"
  };
}

module.exports = { handleCommand };
