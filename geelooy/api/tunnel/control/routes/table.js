// B"H

const { me } = require("./me.js");
const { device } = require("./device.js");
const { devices } = require("./devices.js");
const { myDevice } = require("./myDevice.js");
const { apiKeys } = require("./apiKeys.js");
const { createApiKey } = require("./createApiKey.js");
const { revokeApiKey } = require("./revokeApiKey.js");
const { usage } = require("./usage.js");
const { protectedFs } = require("./protectedFs.js");
const { previewProxy } = require("./previewProxy.js");
const { openApi } = require("./openApi.js");
const { openApiKey } = require("./openApiKey.js");
const { docsHtml } = require("./docsHtml.js");
const { docsJson } = require("./docsJson.js");
const { bootstrap } = require("./bootstrap.js");
const { osFs } = require("./osFs.js");
const { blob } = require("./blob.js");
const { blobView } = require("./blobView.js");
const { blobManifest } = require("./blobManifest.js");
const { handoff } = require("./handoff.js");

/**
 * B"H
 * Chapter 10: The routes gathered like constellations around one crown.
 *
 * The route table now exposes the devices registry and keeps the same fs paths
 * for local and virtual vessels. Agents can switch by changing only the tunnel
 * segment: a real tunnel name, `auto`, or `awtsmoos-virtual-os`.
 */
const routeTable = {
  me,
  "me/": me,

  device,
  "device/": device,
  devices,
  "devices/": devices,

  "my-device": myDevice,
  "my-device/": myDevice,

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

  "handoff/:tunnelName": handoff,
  "handoff/:tunnelName/": handoff,
  "blob/:blobId/manifest": blobManifest,
  "blob/:blobId/manifest/": blobManifest,
  "blob/:blobId/view": blobView,
  "blob/:blobId/view/": blobView,
  "blob/:blobId": blob,
  "blob/:blobId/": blob,

  "preview/:tunnelName": previewProxy,
  "preview/:tunnelName/": previewProxy,

  "fs/awtsmoos-os": osFs,
  "fs/awtsmoos-os/": osFs,
  "fs/:tunnelName": protectedFs,
  "fs/:tunnelName/": protectedFs,

  openapi: openApi,
  "openapi/": openApi,

  "openapi-key": openApiKey,
  "openapi-key/": openApiKey,

  docs: docsHtml,
  "docs/": docsHtml,

  "docs.json": docsJson,
  "docs.json/": docsJson
};

module.exports = { routeTable };
