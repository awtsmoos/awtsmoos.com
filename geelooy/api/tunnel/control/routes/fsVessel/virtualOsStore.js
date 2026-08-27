//B"H
//Boruch Hashem
//Blessed is He

const { dispatchHostedVirtualOs } = require("./hostedVirtualOs/dispatcher.js");

/**
 * B"H
 * The hosted store is a small stable doorway into the already-existing Awtsmoos
 * OS filesystem. The Awtsmoos creates one reality through many interfaces;
 * Awtsmoos.com keeps this facade immutable so callers cannot replace its heart.
 */
const hostedVirtualOsStore = Object.freeze({
	kind: "hosted-virtual-os-store",
	schemaVersion: 1,

	/**
	 * Dispatch one authenticated filesystem or recovery deed.
	 *
	 * @param {object} $i Server context with persistent database access.
	 * @param {string} userId Authenticated user identity.
	 * @param {object} payload Normalized tunnel filesystem payload.
	 * @returns {Promise<object>} Hosted filesystem response.
	 */
	async dispatch($i, userId, payload = {}) {
		return await dispatchHostedVirtualOs($i, userId, payload);
	}
});

module.exports = {
	hostedVirtualOsStore
};
