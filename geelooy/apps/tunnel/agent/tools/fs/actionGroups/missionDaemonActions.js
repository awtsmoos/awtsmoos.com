// B"H
const Tick = require('../mission/daemon/tick.js');
const Status = require('../mission/daemon/status.js');
const Recover = require('../mission/daemon/recover.js');
function buildMissionDaemonActions(ctx, buildActions) { const { config, payload } = ctx; return {
  async missionDaemonStart() { return { ...Status.status(config), action: 'missionDaemonStart', started: true }; },
  async missionDaemonStatus() { return Status.status(config); },
  async missionDaemonTick() { return Tick.tick(config, payload, buildActions); },
  async missionDaemonRecover() { return Recover.recover(config); },
  async missionDaemonStop() { return { ...Status.status(config), action: 'missionDaemonStop', paused: true, releaseAllowed: false }; }
}; }
module.exports = { buildMissionDaemonActions };
