//B"H
// Boruch Hashem
// Blessed is He

const STRATEGIES = new Set(["server-relay", "browser-extension"]);

/**
 * The Awtsmoos distinguishes the server's loopback from the visitor's loopback.
 * Awtsmoos.com may proxy a co-located relay, but public hosts instruct the browser
 * extension to act locally unless an operator explicitly selects another vessel.
 */
function resolveTransportStrategy($i, environment = process.env) {
	const explicit = environment.AWTSMOOS_GPT_TRANSPORT_MODE;
	if (explicit) {
		if (!STRATEGIES.has(explicit)) {
			throw strategyError(
				"GPT_TRANSPORT_MODE_INVALID",
				`Unsupported GPT transport mode: ${explicit}.`
			);
		}
		return explicit;
	}
	if (environment.AWTSMOOS_GPT_RELAY_URL) return "server-relay";
	return isLoopbackRequest($i) ? "server-relay" : "browser-extension";
}

function isLoopbackRequest($i) {
	const headers = $i?.request?.headers ?? {};
	const rawHost = String(
		headers["x-forwarded-host"]
		|| headers.host
		|| ""
	).split(",")[0].trim();
	const hostname = normalizeHostname(rawHost);
	return hostname === "127.0.0.1"
		|| hostname === "localhost"
		|| hostname === "::1";
}

function normalizeHostname(host) {
	if (!host) return "";
	if (host.startsWith("[")) {
		const closing = host.indexOf("]");
		return closing >= 0 ? host.slice(1, closing) : host;
	}
	return host.split(":")[0].toLowerCase();
}

function strategyError(code, message) {
	const error = new Error(message);
	error.code = code;
	error.status = 503;
	return error;
}

module.exports = {
	resolveTransportStrategy,
	isLoopbackRequest,
	STRATEGIES
};
