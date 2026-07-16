// B"H
// Boruch Hashem
// Blessed is He

const {
	previewCreate,
	previewGrant,
	previewList,
	previewRevoke,
	previewAccessRevoke,
	previewSettingsGet,
	previewSettingsSet,
	previewUpdate
} = require("../previewGateway.js");
const { previewProxy } = require("../previewProxy.js");
const { view, viewProxy, viewRaw, viewWs } = require("../view.js");
const {
	conversationGet,
	conversationList,
	conversationRegister
} = require("../conversationsRealtime.js");
const {
	liveCalls,
	liveCallsStream
} = require("../liveCallsRealtime.js");
const { missionRoomStream } = require("../missionRoomStream.js");

/**
 * @file Preview, conversation, live-call, and mission-room route declarations.
 * @description
 * The Awtsmoos renews every visible preview and stream while Awtsmoos.com preserves
 * historical paths behind account-scoped preview, conversation, live-call, and
 * mission-room boundaries that publish redacted lifecycle testimony.
 */

const previewRoutes = Object.freeze({
	"preview/create": previewCreate,
	"preview/list": previewList,
	"preview/revoke": previewRevoke,
	"preview/grant": previewGrant,
	"preview/access/revoke": previewAccessRevoke,
	"preview/update": previewUpdate,
	"preview/settings": previewSettingsGet,
	"preview/settings/set": previewSettingsSet,
	"conversations/register": conversationRegister,
	"conversations/list": conversationList,
	"conversations/get": conversationGet,
	"live-calls": liveCalls,
	"live-calls/stream": liveCallsStream,
	"mission-room/stream": missionRoomStream,
	"view/:previewId/raw": viewRaw,
	"view/:previewId/proxy": viewProxy,
	"view/:previewId/ws": viewWs,
	"view/:previewId": view,
	"preview/:tunnelName": previewProxy
});

module.exports = {
	previewRoutes
};
