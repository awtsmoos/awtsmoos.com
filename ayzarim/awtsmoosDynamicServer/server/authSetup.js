// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Joins HTTP and WebSocket OAuth to one verified Awtsmoos.com key.
 * The Awtsmoos illuminates the signed and proven shore;
 * the fallback may never unlock a client's file door.
 */
function loadSecret(dependencies, directory) {
	if (typeof dependencies.config?.secret !== "string") return null;
	try {
		return require(directory + dependencies.config.secret);
	} catch {
		return { BH: 'B"H', noKey: "No security" };
	}
}

/** Existing HTTP fallback is never accepted as a file-transfer signing key. */
function trustedSigningKey(secret) {
	return Boolean(secret && typeof secret === "object" &&
		!Object.prototype.hasOwnProperty.call(secret, "noKey"));
}

/**
 * Share only the actual configured HTTP signing key with the socket verifier.
 * A weak/missing source leaves the new binary lane permanently fail-closed.
 */
function installSocketAuth(server, dependencies, authenticator, trusted) {
	if (!server.ws) return;
	server.ws.auth = authenticator;
	server.ws.parseCookies = dependencies.Utils.parseCookies;
	server.ws.secret = trusted ? server.secret : null;
}

/** Preserve existing HTTP behavior, but exclude its legacy fallback from WS. */
function installAuth(server, dependencies, directory) {
	const secret = loadSecret(dependencies, directory);
	if (!secret) return;
	server.secret = JSON.stringify(secret);
	const authenticator = new dependencies.Auth(server.secret);
	server.auth = authenticator;
	server.use(authenticator.sessionMiddleware.bind(authenticator));
	installSocketAuth(server, dependencies, authenticator,
		trustedSigningKey(secret));
}

module.exports = { installAuth, installSocketAuth, loadSecret,
	trustedSigningKey };
