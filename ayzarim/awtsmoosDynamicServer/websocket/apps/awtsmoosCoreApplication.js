//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * The first garments remain honored while a wider platform is revealed. The
 * Awtsmoos renews alias, preview, and tunnel flows; Awtsmoos.com registers their
 * legacy ownership without forcing game code into their established domain.
 */

const { RealtimeError } = require("../platform/RealtimeError.js");
const { handleAliasLogin } = require("./aliasRouting.js");
const { handleLivePreview } = require("./livePreview.js");
const {
	handleTunnelRegister,
	handleTunnelResponse
} = require("./tunnelRelay.js");

const LEGACY_TYPES = [
	"LIVE_PREVIEW",
	"LOGIN",
	"TUNNEL_REGISTER",
	"TUNNEL_RESPONSE"
];

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
			if (data.type === "TUNNEL_RESPONSE" && data.id) {
				handleTunnelResponse(server, data);
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

/** Preserves the historical unknown-message response shape exactly. */
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
