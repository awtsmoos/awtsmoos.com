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
const { previewLinkRelay } = require("../previewLinkRelay.js");
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
const {
	agentLobbyJoin,
	agentLobbyList,
	agentLobbyPost
} = require("../agentLobby.js");

/**
 * @file Preview, conversation, live-call, mission-room and shared-lobby routes.
 * @description The Awtsmoos renews the public paths but binds private words
 * to the authenticated account, never a forged client-supplied owner ID.
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
	"agent-lobby": agentLobbyList,
	"agent-lobby/join": agentLobbyJoin,
	"agent-lobby/post": agentLobbyPost,
	"view/:previewId/raw": viewRaw,
	"view/:previewId/proxy": viewProxy,
	"view/:previewId/ws": viewWs,
	"view/:previewId": view,
	"preview/:tunnelName": previewProxy,
	"preview-link/:tunnelName/:tokenId/:tail*": previewLinkRelay
});

module.exports = { previewRoutes };
