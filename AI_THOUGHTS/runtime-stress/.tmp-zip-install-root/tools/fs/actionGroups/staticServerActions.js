// B"H
const { staticServerStart, staticServerList, staticServerStop, staticServerLogs } = require("../staticServers.js");

function buildStaticServerActions(ctx) {
  const { config, payload } = ctx;

  return {
    async staticServerStart() { return await staticServerStart(config, payload); },
    async staticServerList() { return await staticServerList(payload); },
    async staticServerStop() { return await staticServerStop(payload); },
    async staticServerLogs() { return await staticServerLogs(payload); }
  };
}

module.exports = { buildStaticServerActions };
