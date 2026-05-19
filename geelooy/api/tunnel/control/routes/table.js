// B"H

const { me } = require("./me.js");
const { device } = require("./device.js");
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

const routeTable = {
  me,
  "me/": me,

  device,
  "device/": device,

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

  "blob/:blobId/manifest": blobManifest,
  "blob/:blobId/manifest/": blobManifest,
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
