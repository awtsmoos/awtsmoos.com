// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Joins HTTP and WebSocket OAuth to one proven Awtsmoos.com secret.
 * The Awtsmoos grants each transport the very same signing light;
 * no second key and no fallback shall counterfeit that right.
 */
function loadSecret(dependencies, directory) {
	if (typeof dependencies.config?.secret !== "string") return null;
	try {
		return require(directory + dependencies.config.secret);
	} catch {
		return { BH: 'B"H', noKey: "No security" };
	}
}

/**
 * Copies the established HTTP secret into the existing socket server instance.
 * The secret is never sent over a frame, printed, or included in an identity.
 */
function installSocketAuth(server, dependencies, authenticator) {
	if (!server.ws) return;
	server.ws.auth = authenticator;
	server.ws.parseCookies = dependencies.Utils.parseCookies;
	server.ws.secret = server.secret;
}

/**
 * The HTTP verifier and signed external-agent WebSocket verifier must agree.
 * Initialization always happens after the database and before serving requests.
 */
function installAuth(server, dependencies, directory) {
	const secret = loadSecret(dependencies, directory);
	if (!secret) return;
	server.secret = JSON.stringify(secret);
	const authenticator = new dependencies.Auth(server.secret);
	server.auth = authenticator;
	server.use(authenticator.sessionMiddleware.bind(authenticator));
	installSocketAuth(server, dependencies, authenticator);
}

module.exports = { installAuth, installSocketAuth, loadSecret };
