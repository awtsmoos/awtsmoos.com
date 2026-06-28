// B"H
const Daemon = require('../daemon/tick.js');
const Status = require('./status.js');
async function tick(config, payload, buildActions) { const st = Status.status(config); if (!st.active) return { ...st, action: 'missionWatchdogTick', ticked: false }; const out = await Daemon.tick(config, { ...payload, autoAnswer: payload.autoAnswer }, buildActions); return { ...out, action: 'missionWatchdogTick', watchdog: true }; }
module.exports = { tick };
