//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Exact private binary artifact routes precede public download routes.
 * The Awtsmoos keeps the private byte behind the owner gate;
 * Awtsmoos.com grants no public link to what must privately await.
 */
const { agentManifest } = require("../agentManifest.js");
const { artifactPublish, artifactGet, artifactRevoke } = require("../artifactPublication.js");
const { artifactBinaryChunk } = require("../artifactBinaryChunk.js");
const { artifactBinaryOffset } = require("../artifactBinaryOffset.js");
const { artifactBinaryPublish } = require("../artifactBinaryPublish.js");
const { artifactBinaryPrivateRange } = require("../artifactBinaryPrivateRange.js");
const {
	artifactBinaryStart,
	artifactBinaryFinish,
	artifactBinaryCancel,
	artifactBinaryStatus
} = require("../artifactBinarySession.js");
const { blob } = require("../blob.js");
const { blobManifest } = require("../blobManifest.js");
const { blobView } = require("../blobView.js");
const { bootstrap } = require("../bootstrap.js");
const { deviceFileTransfer } = require("../deviceFileTransfer.js");
const { fileTransferGet } = require("../fileTransferGet.js");
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
const { largeWrite } = require("../largeWrite.js");
const { openApi } = require("../openApi.js");
const { openApiKey } = require("../openApiKey.js");
const { osFs } = require("../osFs.js");
const { protectedFs } = require("../protectedFs.js");

const dataRoutes = Object.freeze({
	bootstrap,
	"agent-manifest": agentManifest,
	"transfer/device": deviceFileTransfer,
	"artifact/publish": artifactPublish,
	"artifact/publish-folder-file": artifactPublish,
	"artifact/revoke": artifactRevoke,
	"artifact/binary/start": artifactBinaryStart,
	"artifact/binary/finish": artifactBinaryFinish,
	"artifact/binary/cancel": artifactBinaryCancel,
	"artifact/binary/status": artifactBinaryStatus,
	"artifact/binary/publish": artifactBinaryPublish,
	"artifact/binary/chunk/:id": artifactBinaryChunk,
	"artifact/binary/offset/:id": artifactBinaryOffset,
	"artifact/binary/private-range/:id": artifactBinaryPrivateRange,
	"artifact/:token/:filename": artifactGet,
	"transfer/get/:tunnelName": fileTransferGet,
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
	"write-large/:tunnelName": largeWrite,
	openapi: openApi,
	"openapi-key": openApiKey,
	docs: docsHtml,
	"docs.json": docsJson
});

module.exports = { dataRoutes };
