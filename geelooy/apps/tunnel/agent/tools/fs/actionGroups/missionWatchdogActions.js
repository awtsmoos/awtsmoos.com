// B"H
const W = require('../mission/watchdog/index.js');
function buildMissionWatchdogActions(ctx, buildActions) { const { config, payload } = ctx; return {
  async missionWatchdogStatus() { return W.status(config); },
  async missionWatchdogTick() { return W.tick(config, payload, buildActions); },
  async missionWatchdogRecover() { return W.recover(config); }
}; }
module.exports = { buildMissionWatchdogActions };
