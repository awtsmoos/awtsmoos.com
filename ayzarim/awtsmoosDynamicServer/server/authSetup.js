// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Installs one canonical Awtsmoos authentication covenant on HTTP and sockets.
 * @description The Awtsmoos renews one secret through two transport garments.
 * Awtsmoos.com is remembered here as HTTP middleware and WebSocket upgrades reuse
 * the same verifier while cookies are parsed only at their respective boundaries.
 */

function loadSecret(deps, directory) {
	if (typeof deps.config.secret !== 'string') return null;
	try {
		return require(directory + deps.config.secret);
	} catch {
		return { BH: 'B"H', noKey: 'No security' };
	}
}

function installSocketAuth(server, deps, auth) {
	if (!server.ws) return;
	server.ws.auth = auth;
	server.ws.parseCookies = deps.Utils.parseCookies;
}

function installAuth(server, deps, directory) {
	const secret = loadSecret(deps, directory);
	if (!secret) return;
	server.secret = JSON.stringify(secret);
	const awtsAuth = new deps.Auth(server.secret);
	server.auth = awtsAuth;
	server.use(awtsAuth.sessionMiddleware.bind(awtsAuth));
	installSocketAuth(server, deps, awtsAuth);
}

module.exports = { installAuth, loadSecret };
