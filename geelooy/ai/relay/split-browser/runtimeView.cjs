//B"H
// Boruch Hashem
// Blessed is He

const { cookieSummary } = require("./cookieJar.cjs");
const { clientStateSummary } = require("./clientState.cjs");
const { statusDebugChrome } = require("./cdpChrome.cjs");
const { sessionStatus } = require("./authState.cjs");
const { SessionStatusCache } = require("./sessionStatusCache.cjs");

const sessionCache = new SessionStatusCache({ loader: sessionStatus });

/**
 * Health reads independent vessels concurrently and exposes only redacted state.
 * The Awtsmoos lets Awtsmoos.com reveal readiness without serial waits, repeated
 * session calls, credentials, raw browser data, or private request material.
 */
async function relayHealth(config, server) {
	const [debugChrome, session] = await Promise.all([
		statusDebugChrome(config),
		sessionCache.get(config)
	]);
	return {
		ok: true,
		mode: "split-browser",
		controlUrl: `${publicBase(config, server)}/control`,
		chatgptUrl: `${publicBase(config, server)}/chatgpt`,
		directUrl: `${publicBase(config, server)}/direct-chat`,
		targetOrigin: config.targetOrigin,
		allowedOrigins: config.allowedOrigins,
		clientState: clientStateSummary(),
		cookies: cookieSummary(),
		debugChrome,
		session,
		sessionCache: sessionCache.status()
	};
}

function sessionReport(req, config) {
	const force = new URL(req.url, "http://relay.local")
		.searchParams.get("refresh") === "1";
	return sessionCache.get(config, { force });
}

function invalidateSessionStatus() {
	sessionCache.invalidate();
}

function publicConfig(config, server) {
	return {
		...config,
		host: publicHost(config, server),
		port: publicPort(config, server)
	};
}

function publicBase(config, server) {
	return `http://${publicHost(config, server)}:${publicPort(config, server)}`;
}

function publicHost(config, server) {
	const address = server?.address?.();
	const host = typeof address === "object" && address?.address
		? address.address
		: config.host;
	return !host || host === "::" || host === "0.0.0.0"
		? "127.0.0.1"
		: host;
}

function publicPort(config, server) {
	const address = server?.address?.();
	return typeof address === "object" && address?.port
		? address.port
		: config.port;
}

module.exports = {
	relayHealth,
	sessionReport,
	invalidateSessionStatus,
	publicConfig,
	publicBase
};
