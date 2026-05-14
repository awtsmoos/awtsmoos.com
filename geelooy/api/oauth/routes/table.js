
// B"H

const { start } = require("./start.js");
const { authorize } = require("./authorize.js");
const { token } = require("./token.js");
const { me } = require("./me.js");
const { clients } = require("./clients.js");
const { logout } = require("./logout.js");

/**
 * B"H
 * Route table for the OAuth system.
 *
 * No switch statement. No tangled hallway.
 * A clear table of gates, each gate opening to one chamber.
 *
 * @type {Object<string, Function>}
 */
const routeTable = {
  start,
  authorize,
  token,
  me,
  clients,
  logout
};

module.exports = { routeTable };
