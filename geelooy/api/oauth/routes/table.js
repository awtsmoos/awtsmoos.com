
// B"H

const { start } = require("./start.js");
const { authorize } = require("./authorize.js");
const { token } = require("./token.js");
const { me } = require("./me.js");
const { clients } = require("./clients.js");
const { logout } = require("./logout.js");

/**
 * B"H
 * OAuth route table.
 *
 * The Awtsmoos dynamic server may present the remaining route as:
 * authorize
 * /authorize
 * authorize/
 * /authorize/
 *
 * So every public route is registered in all common forms.
 */
const routeTable = {
  "": start,
  "/": start,

  start,
  "/start": start,
  "start/": start,
  "/start/": start,

  authorize,
  "/authorize": authorize,
  "authorize/": authorize,
  "/authorize/": authorize,

  token,
  "/token": token,
  "token/": token,
  "/token/": token,

  me,
  "/me": me,
  "me/": me,
  "/me/": me,

  clients,
  "/clients": clients,
  "clients/": clients,
  "/clients/": clients,

  logout,
  "/logout": logout,
  "logout/": logout,
  "/logout/": logout
};

module.exports = { routeTable };
