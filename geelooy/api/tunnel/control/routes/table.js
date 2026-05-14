
// B"H

const { me } = require("./me.js");
const { device } = require("./device.js");
const { apiKeys } = require("./apiKeys.js");
const { createApiKey } = require("./createApiKey.js");
const { revokeApiKey } = require("./revokeApiKey.js");
const { usage } = require("./usage.js");
const { protectedFs } = require("./protectedFs.js");

/**
 * B"H
 * Tunnel control route table.
 *
 * This is the account-facing layer. The old raw /api/tunnel/fs/:tunnelName
 * endpoint can remain for development, but serious callers should move toward
 * this protected control API.
 */
const routeTable = {
  me,
  device,
  "api-keys": apiKeys,
  "api-keys/create": createApiKey,
  "api-keys/revoke": revokeApiKey,
  usage,
  "fs/:tunnelName": protectedFs
};

module.exports = { routeTable };
