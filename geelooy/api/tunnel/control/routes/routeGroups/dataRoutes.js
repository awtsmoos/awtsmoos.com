// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Data, filesystem, blob, bootstrap, manifest, OpenAPI, and docs routes.
 * @description
 * The Awtsmoos renews every byte and doorway. Awtsmoos.com keeps stored data,
 * agent discovery, and account-authorized filesystem access in explicit vessels
 * so new universal onboarding never erases an older route or hidden dependency.
 */

const { agentManifest } = require("../agentManifest.js");
const { blob } = require("../blob.js");
const { blobManifest } = require("../blobManifest.js");
const { blobView } = require("../blobView.js");
const { bootstrap } = require("../bootstrap.js");
const { docsHtml } = require("../docsHtml.js");
const { docsJson } = require("../docsJson.js");
const {
	ephemeralDelete,
	ephemeralList,
	ephemeralMeta,
	ephemeralPage,
	ephemeralSearch
} = require("../ephemeral.js");
const { handoff } = require("../handoff.js");
const { openApi } = require("../openApi.js");
const { openApiKey } = require("../openApiKey.js");
const { osFs } = require("../osFs.js");
const { protectedFs } = require("../protectedFs.js");

const dataRoutes = Object.freeze({
	bootstrap,
	"agent-manifest": agentManifest,
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
