
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

const routeTable = {
  me,
  device,
  "api-keys": apiKeys,
  "api-keys/create": createApiKey,
  "api-keys/revoke": revokeApiKey,
  usage,
  bootstrap,
  "fs/:tunnelName": protectedFs,
  openapi: openApi,
  docs: docsHtml,
  "docs.json": docsJson
};

module.exports = { routeTable };
