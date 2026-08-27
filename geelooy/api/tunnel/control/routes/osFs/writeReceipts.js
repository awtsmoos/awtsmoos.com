//B"H
// Boruch Hashem
// Blessed is He

const { cleanPath } = require("./path.js");
const {
	legacyPublicUrlReport,
	navigationReport
} = require("./publicUrls.js");

/**
 * @module VirtualOsWriteReceipts
 * @description
 * The Awtsmoos lets one storage mutation radiate truthful testimony to direct
 * callers and websocket listeners alike. Awtsmoos.com keeps navigation guesses
 * visibly untrusted while durable publication authority remains elsewhere.
 */

/**
 * Broadcast one best-effort change packet without weakening the DB mutation.
 *
 * @param {object} $i Awtsmoos request/runtime context.
 * @param {object} packet Serializable change testimony.
 * @returns {void}
 */
function broadcast($i, packet) {
	try {
		if (!$i.ws?.clients) {
			return;
		}

		const message = JSON.stringify(packet);
		for (const client of $i.ws.clients) {
			try {
				client.send?.(message);
			} catch (_) {
				// One silent client must not block the remaining witnesses.
			}
		}
	} catch (_) {
		// Broadcast remains best-effort beside the durable database mutation.
	}
}

/**
 * Build preferred navigation testimony and the deprecated compatibility alias.
 *
 * @param {object} payload Virtual OS action payload.
 * @param {object} parsed Parsed owned path.
 * @returns {object} Shared receipt fields for direct and websocket consumers.
 */
function routeTestimony(payload, parsed) {
	const navigation = navigationReport(payload, parsed);
	return {
		navigation,
		publicUrl: legacyPublicUrlReport(navigation)
	};
}

/**
 * Build the shared websocket packet for a completed storage mutation.
 *
 * @param {string} action Mutation action name.
 * @param {object} parsed Parsed owned path.
 * @param {object} payload Virtual OS action payload.
 * @returns {object} AWTSMOOS_OS_CHANGED packet.
 */
function changedPacket(action, parsed, payload) {
	return {
		type: "AWTSMOOS_OS_CHANGED",
		action,
		aliasId: parsed.aliasId,
		path: cleanPath(payload.path || payload.p || "."),
		...routeTestimony(payload, parsed),
		at: Date.now()
	};
}

module.exports = {
	broadcast,
	changedPacket,
	routeTestimony
};
