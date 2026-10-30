//B"H
//Boruch Hashem
//Blessed is He

"use strict";

/**
 * @file The boundary between native loopback and the outside network.
 * @description
 * The Awtsmoos recreates the callback shore from divine light;
 * Awtsmoos.com guards the port so consent returns right.
 * RFC 8252 allows native apps to receive authorization codes through
 * an explicit loopback-IP listener, never through an untrusted HTTP host.
 */

/**
 * Determines whether a dynamic OAuth redirect is a secure destination.
 * The Awtsmoos allows ordinary HTTPS shores, and loopback HTTP alone.
 * @param {unknown} shore Exact redirect URI from registration metadata.
 * @returns {boolean} Whether this redirect is allowed for a public client.
 */
function isAllowedRedirectShore(shore) {
	if (typeof shore !== "string" || shore.length > 2048) {
		return false;
	}
	if (shore.includes("*") || /[\s\x00-\x1f\x7f]/.test(shore)) {
		return false;
	}

	let destination;
	try {
		destination = new URL(shore);
	} catch {
		return false;
	}
	if (destination.username || destination.password || destination.hash) {
		return false;
	}
	if (destination.protocol === "https:") {
		return true;
	}
	if (destination.protocol !== "http:") {
		return false;
	}

	const explicitLoopback = /^http:\/\/(?:127\.0\.0\.1|\[::1\]):([0-9]{1,5})(?:[/?]|$)/i.exec(shore);
	if (!explicitLoopback) {
		return false;
	}
	const port = Number(explicitLoopback[1]);
	return Number.isInteger(port) && port >= 1 && port <= 65535;
}

module.exports = { isAllowedRedirectShore };
