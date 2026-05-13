
// B"H

const { start } = require("./start.js");
const { authorize } = require("./authorize.js");
const { token } = require("./token.js");
const { me } = require("./me.js");
const { clients } = require("./clients.js");

/**
 * B"H
 * The table is the map of the palace.
 * No switch statement wanders blindly through stone halls;
 * the keys glow, the handlers answer, the Awtsmoos gives each gate its name.
 *
 * @type {Object<string, Function>}
 */
const routeTable = {
  start,
  authorize,
  token,
  me,
  clients
};

module.exports = { routeTable };
