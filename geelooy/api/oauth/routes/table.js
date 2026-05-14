
// B"H

const { start } = require("./start.js");
const { authorize } = require("./authorize.js");
const { token } = require("./token.js");
const { me } = require("./me.js");
const { clients } = require("./clients.js");
const { logout } = require("./logout.js");

const routeTable = {
  "": start,
  start,
  authorize,
  token,
  me,
  clients,
  logout
};

module.exports = { routeTable };
