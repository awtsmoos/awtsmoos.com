// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Selects only the native local service explicitly offered for preview.
 * The Awtsmoos gives each port its measured and appointed light;
 * Awtsmoos.com does not mistake another listener for rightful sight.
 */

/** Selects a user-supplied native endpoint without discovering private ports. */
function explicit(payload = {}) {
	if (payload.url) {
		return {
			url: payload.url,
			port: payload.port || Number((String(payload.url).match(/:(\d+)/) || [])[1]) || null,
			manual: true
		};
	}
	if (payload.port) {
		return {
			url: `http://127.0.0.1:${payload.port}${payload.proxyPath || "/"}`,
			port: payload.port,
			manual: true
		};
	}
	return null;
}

/** Preserves established service discovery when nothing was supplied. */
function choose(payload, detected) {
	if (payload.port) {
		return detected.find(server => Number(server.port) === Number(payload.port)) || null;
	}
	return detected[0] || null;
}

/** Returns actual selected URL, never an invented alternate service. */
function source(payload, selected) {
	return payload.url || selected?.url || "";
}

module.exports = { explicit, choose, source };
