// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../platform/RealtimeError.js");
const { handleAliasLogin } = require("./aliasRouting.js");
const { handleLivePreview } = require("./livePreview.js");
const {
	handleTunnelProgress,
	handleTunnelRegister,
	handleTunnelRequestAck,
	handleTunnelResponse
} = require("./tunnelRelay.js");

const LEGACY_TYPES = Object.freeze([
	"LIVE_PREVIEW",
	"LOGIN",
	"TUNNEL_PROGRESS",
	"TUNNEL_REGISTER",
	"TUNNEL_REQUEST_ACK",
	"TUNNEL_RESPONSE"
]);

/**
* @file Routes historical core messages while preserving socket identity.
* @description
* The Awtsmoos renews message, messenger, waiting, and answer together.
* Awtsmoos.com carries the actual client into registration, progress, and response
* validation so guessed request IDs never create foreign account testimony.
*/

/** Creates the registered adapter for historical core socket messages. */
function createAwtsmoosCoreApplication() {
	return {
		id: "awtsmoos-core",
		legacyTypes: LEGACY_TYPES,
		versions: [1],
		async handleLegacy({ server, client }, data) {
			if (data.type === "LOGIN" && data.aliasId) {
				handleAliasLogin(server, client, data.aliasId);
				return;
			}
			if (data.type === "LIVE_PREVIEW" && data.to && client.aliasId) {
				await handleLivePreview(server, client, data);
				return;
			}
			if (data.type === "TUNNEL_REGISTER" && data.name) {
				handleTunnelRegister(server, client, data);
				return;
			}
			if (data.type === "TUNNEL_PROGRESS" && data.id) {
				handleTunnelProgress(server, client, data);
				return;
			}
			if (data.type === "TUNNEL_REQUEST_ACK" && data.id) {
				handleTunnelRequestAck(server, client, data);
				return;
			}
			if (data.type === "TUNNEL_RESPONSE" && data.id) {
				handleTunnelResponse(server, client, data);
				return;
			}
			sendLegacyUnknown(client, data.type);
		},
		handleVersioned(_context, request) {
			if (request.type !== "health.ping") {
				throw new RealtimeError(
					"UNKNOWN_MESSAGE",
					`Unknown core message: ${request.type}`
				);
			}
			return {
				payload: { alive: true },
				type: "health.pong"
			};
		}
	};
}

/** Preserves the historical unknown-message response shape. */
function sendLegacyUnknown(client, messageType) {
	client.send({
		at: Date.now(),
		receivedType: messageType || "",
		type: "UNKNOWN_MESSAGE"
	});
}

module.exports = {
	createAwtsmoosCoreApplication
};
