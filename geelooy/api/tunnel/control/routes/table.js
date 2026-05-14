
// B"H

const { me } = require("./me.js");
const { device } = require("./device.js");
const { apiKeys } = require("./apiKeys.js");
const { createApiKey } = require("./createApiKey.js");
const { revokeApiKey } = require("./revokeApiKey.js");
const { usage } = require("./usage.js");
const { protectedFs } = require("./protectedFs.js");
const { openApi } = require("./openApi.js");
const { docsHtml } = require("./docsHtml.js");
const { docsJson } = require("./docsJson.js");
const { bootstrap } = require("./bootstrap.js");

/**
 * B"H
 * Keep both slash and no-slash routes because the Awtsmoos dynamic server
 * treats /docs and /docs/ as different paths in some route flows.
 */
const routeTable = {
  me,
  "me/": me,

  device,
  "device/": device,

  "api-keys": apiKeys,
  "api-keys/": apiKeys,

  "api-keys/create": createApiKey,
  "api-keys/create/": createApiKey,

  "api-keys/revoke": revokeApiKey,
  "api-keys/revoke/": revokeApiKey,

  usage,
  "usage/": usage,

  bootstrap,
  "bootstrap/": bootstrap,

  "fs/:tunnelName": protectedFs,
  "fs/:tunnelName/": protectedFs,

  openapi: openApi,
  "openapi/": openApi,

  docs: docsHtml,
  "docs/": docsHtml,

  "docs.json": docsJson,
  "docs.json/": docsJson
};

module.exports = { routeTable };
