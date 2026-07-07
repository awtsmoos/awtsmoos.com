// B"H
const Actions = require('./actions.js');
const Tick = require('./tick.js');
const Status = require('./status.js');
const Menu = require('./menu.js');
const Daemon = require('./daemon.js');

/** B"H — Chapter 1957: The hour loop enters through one small gate. */
function buildHourLoopActions(payload = {}) { return Actions.build(payload); }
module.exports = { buildHourLoopActions, Actions, Tick, Status, Menu, Daemon };
