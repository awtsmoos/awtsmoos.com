// B"H

const { me } = require("./me.js");
const { device } = require("./device.js");
const { devices } = require("./devices.js");
const { myDevice } = require("./myDevice.js");
const { apiKeys } = require("./apiKeys.js");
const { createApiKey } = require("./createApiKey.js");
const { revokeApiKey } = require("./revokeApiKey.js");
const { usage } = require("./usage.js");
const { compute, computeCapture } = require("./compute.js");
const { protectedFs } = require("./protectedFs.js");
const { previewProxy } = require("./previewProxy.js");
const { previewCreate, previewList, previewRevoke, previewSettingsGet, previewSettingsSet, previewUpdate } = require("./previewGateway.js");
const { view, viewRaw, viewWs } = require("./view.js");
const { ephemeralMeta, ephemeralPage, ephemeralSearch, ephemeralDelete, ephemeralList } = require("./ephemeral.js");
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
 * Chapter 76: Ephemeral AI result routes became first-class doors.
 */
const routeTable = {
  me,
  device,
  devices,
  "my-device": myDevice,
  "api-keys": apiKeys,
  "api-keys/create": createApiKey,
  "api-keys/revoke": revokeApiKey,
  usage,
  compute,
  "compute/capture": computeCapture,
  bootstrap,
  "ephemeral/list": ephemeralList,
  "ephemeral/:resultId/page": ephemeralPage,
  "ephemeral/:resultId/search": ephemeralSearch,
  "ephemeral/:resultId/delete": ephemeralDelete,
  "ephemeral/:resultId": ephemeralMeta,
  "preview/create": previewCreate,
  "preview/list": previewList,
  "preview/revoke": previewRevoke,
  "preview/update": previewUpdate,
  "preview/settings": previewSettingsGet,
  "preview/settings/set": previewSettingsSet,
  "view/:previewId/raw": viewRaw,
  "view/:previewId/ws": viewWs,
  "view/:previewId": view,
  "handoff/:tunnelName": handoff,
  "blob/:blobId/manifest": blobManifest,
  "blob/:blobId/view": blobView,
  "blob/:blobId": blob,
  "preview/:tunnelName": previewProxy,
  "fs/awtsmoos-os": osFs,
  "fs/:tunnelName": protectedFs,
  openapi: openApi,
  "openapi-key": openApiKey,
  docs: docsHtml,
  "docs.json": docsJson
};

module.exports = { routeTable };
