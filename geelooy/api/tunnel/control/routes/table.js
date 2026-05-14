
// B"H

const { me } = require("./me.js");
const { devices } = require("./devices.js");
const { apiKeys } = require("./apiKeys.js");
const { createApiKey } = require("./createApiKey.js");
const { revokeApiKey } = require("./revokeApiKey.js");
const { usage } = require("./usage.js");

const routeTable = {
  me,
  devices,
  "api-keys": apiKeys,
  "api-keys/create": createApiKey,
  "api-keys/revoke": revokeApiKey,
  usage
};

module.exports = { routeTable };
