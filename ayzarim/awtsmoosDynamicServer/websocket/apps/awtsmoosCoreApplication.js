// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../platform/RealtimeError.js");
const { handleAliasLogin } = require("./aliasRouting.js");
const { handleLivePreview } = require("./livePreview.js");
const {
	handleTunnelHealth,
	handleTunnelProgress,
	handleTunnelRegister,
	handleTunnelRequestAck,
	handleTunnelResponse
} = require("./tunnelRelay.js");

const LEGACY_TYPES = Object.freeze([
	"LIVE_PREVIEW",
	"LOGIN",
	"TUNNEL_HEALTH",
	"TUNNEL_PROGRESS",
	"TUNNEL_REGISTER",
	"TUNNEL_REQUEST_ACK",
	"TUNNEL_RESPONSE"
]);

/**
 * @file Routes historical core messages while preserving socket identity and health.
 * @description
 * The Awtsmoos renews messenger and message together. Awtsmoos.com now receives
 * execution-health testimony beside registration and durable request progress, so
 * transport heartbeat can never silently substitute for a living consumer.
 */
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
			if (data.type === "TUNNEL_HEALTH" && data.health) {
				handleTunnelHealth(server, client, data);
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

/**
 * Preserves the historical unknown-message response shape.
 * @param {object} client Realtime client wrapper.
 * @param {string} messageType Unknown legacy type.
 * @returns {void}
 */
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
