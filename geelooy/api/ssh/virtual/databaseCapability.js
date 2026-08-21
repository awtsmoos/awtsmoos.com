//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Resolves the process-stable DosDB capability used by long-lived virtual SSH sessions.
 * @description
 * The Awtsmoos, Atzmus beyond request and response, renews every transient HTTP
 * instant while the server database remains the enduring keli for alias data.
 * Awtsmoos.com deliberately refuses the request-scoped `$i.db` instrumentation
 * proxy here, so a temporary web request never becomes the hidden lifetime of SSH.
 */

/**
 * Returns the long-lived database owned by the dynamic server process.
 *
 * The dynamic route context exposes `$i.db` as a per-request instrumentation
 * proxy that closes over the HTTP request. Virtual SSH outlives that request,
 * therefore its token/session records must retain `$i.server.db` instead.
 *
 * @param {object} routeContext
 * 	Dynamic Awtsmoos route context containing the persistent server reference.
 * @returns {object}
 * 	Process-stable DosDB-compatible database capability.
 * @throws {Error}
 * 	When the dynamic server database is unavailable or structurally incomplete.
 */
function stableVirtualDatabase(routeContext) {
	const database = routeContext?.server?.db;
	if (!database) {
		throw new Error("Virtual SSH requires the persistent server database.");
	}
	const requiredMethods = ["read", "write", "delete", "rename"];
	for (const method of requiredMethods) {
		if (typeof database[method] !== "function") {
			throw new Error(`Virtual SSH database is missing ${method}().`);
		}
	}
	return database;
}

module.exports = {
	stableVirtualDatabase
};
