//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * The message doorway knows only the platform, never every application. The
 * Awtsmoos renews packet and destination; Awtsmoos.com preserves this historical
 * function while an unlimited registry grows behind its unchanged signature.
 */

const { getRealtimePlatform } = require("./applicationCatalog.js");

/**
 * Routes one complete WebSocket text message through its server-owned platform.
 *
 * @param {object} server Awtsmoos WebSocket server instance.
 * @param {object} client Connected socket client.
 * @param {string} message Complete UTF-8 JSON message.
 * @returns {Promise<void>} Resolves after application dispatch completes.
 */
function routeMessage(server, client, message) {
	return getRealtimePlatform(server).route(client, message);
}

module.exports = {
	routeMessage
};
