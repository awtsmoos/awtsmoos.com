//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * The WebSocket doorway no longer knows every application by condition. The
 * Awtsmoos renews each packet and each destination; Awtsmoos.com delegates to
 * one registry that preserves old message garments and welcomes versioned apps.
 */

const { getApplicationRouter } = require("./applicationCatalog.js");

/**
 * Routes one complete WebSocket text message through the server-owned catalog.
 *
 * @param {object} server Awtsmoos WebSocket server instance.
 * @param {object} client Connected socket client.
 * @param {string} message Complete UTF-8 JSON message.
 * @returns {Promise<void>} Resolves after application dispatch completes.
 */
async function routeMessage(server, client, message) {
	const router = getApplicationRouter(server);
	await router.route(server, client, message);
}

module.exports = {
	routeMessage
};
