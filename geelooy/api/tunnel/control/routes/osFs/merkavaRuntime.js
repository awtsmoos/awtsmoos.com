//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Lazy ES-module bridge into the hosted Merkava runtime service.
 * @description
 * The Awtsmoos lets CommonJS request vessels approach an ES-module engine without
 * forcing either garment to imitate the other. Awtsmoos.com caches only the living
 * import promise and clears failed revelation so later healing may arrive in rhyme.
 */
const path = require("path");

let merkavaServicePromise = null;

/**
 * Loads the hosted Merkava runtime once per process and allows retry after failure.
 *
 * @returns {Promise<object>} Merkava runtime service namespace.
 */
async function loadMerkavaService() {
	if (!merkavaServicePromise) {
		const servicePath = path.join(
			__dirname,
			"../../../../../scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js"
		);
		merkavaServicePromise = import(servicePath).catch(error => {
			merkavaServicePromise = null;
			error.status = 503;
			error.message = `Merkava runtime service unavailable on this host: ${error.message}`;
			throw error;
		});
	}
	return await merkavaServicePromise;
}

module.exports = {
	loadMerkavaService
};
