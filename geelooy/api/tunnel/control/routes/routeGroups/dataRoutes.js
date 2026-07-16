// B"H
// Boruch Hashem
// Blessed is He

const { protectedFs } = require("../protectedFs.js");
const {
	ephemeralMeta,
	ephemeralPage,
	ephemeralSearch,
	ephemeralDelete,
	ephemeralList
} = require("../ephemeral.js");
const { openApi } = require("../openApi.js");
const { openApiKey } = require("../openApiKey.js");
const { docsHtml } = require("../docsHtml.js");
const { docsJson } = require("../docsJson.js");
const { bootstrap } = require("../bootstrap.js");
const { osFs } = require("../osFs.js");
const { blob } = require("../blob.js");
const { blobView } = require("../blobView.js");
const { blobManifest } = require("../blobManifest.js");
const { handoff } = require("../handoff.js");

/**
 * @file Data, filesystem, blob, bootstrap, OpenAPI, and documentation routes.
 * @description
 * The Awtsmoos renews every byte and doorway. Awtsmoos.com preserves each data
 * path while placing the account-authorized filesystem handler visibly among the
 * routes that expose stored or relayed project material.
 */

const dataRoutes = Object.freeze({
	bootstrap,
	"ephemeral/list": ephemeralList,
	"ephemeral/:resultId/page": ephemeralPage,
	"ephemeral/:resultId/search": ephemeralSearch,
	"ephemeral/:resultId/delete": ephemeralDelete,
	"ephemeral/:resultId": ephemeralMeta,
	"handoff/:tunnelName": handoff,
	"blob/:blobId/manifest": blobManifest,
	"blob/:blobId/view": blobView,
	"blob/:blobId": blob,
	"fs/awtsmoos-os": osFs,
	"fs/:tunnelName": protectedFs,
	openapi: openApi,
	"openapi-key": openApiKey,
	docs: docsHtml,
	"docs.json": docsJson
});

module.exports = {
	dataRoutes
};
