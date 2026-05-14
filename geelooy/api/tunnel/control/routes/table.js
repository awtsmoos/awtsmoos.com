
// B"H

const { me } = require("./me.js");
const { device } = require("./device.js");
const { apiKeys } = require("./apiKeys.js");
const { createApiKey } = require("./createApiKey.js");
const { revokeApiKey } = require("./revokeApiKey.js");
const { usage } = require("./usage.js");
const { protectedFs } = require("./protectedFs.js");
const { openApi } = require("./openApi.js");

/**
 * B"H
 * Tunnel control route table.
 *
 * Important:
 * - /api/tunnel/control/fs/:tunnelName is protected by session/OAuth/API-key.
 * - The old raw /api/tunnel/fs/:tunnelName route is only dev-mode.
 * - /api/tunnel/control/openapi returns YAML for a Custom GPT Action.
 */
const routeTable = {
  me,
  device,
  "api-keys": apiKeys,
  "api-keys/create": createApiKey,
  "api-keys/revoke": revokeApiKey,
  usage,
  "fs/:tunnelName": protectedFs,
  openapi: openApi
};

module.exports = { routeTable };
