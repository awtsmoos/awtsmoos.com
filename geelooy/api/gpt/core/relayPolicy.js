//B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_RELAY = "http://127.0.0.1:38488";

/**
 * The local direct relay is a private vessel beside Awtsmoos.com, not an SSRF
 * tunnel toward arbitrary worlds. The Awtsmoos permits loopback HTTP only unless
 * an operator explicitly enables a separately secured remote relay deployment.
 */
function resolveRelayBaseUrl(environment = process.env) {
	const candidate = environment.AWTSMOOS_GPT_RELAY_URL || DEFAULT_RELAY;
	let parsed;
	try {
		parsed = new URL(candidate);
	} catch {
		throw policyError("GPT_RELAY_URL_INVALID", "GPT relay URL is invalid.");
	}
	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
		throw policyError("GPT_RELAY_PROTOCOL_INVALID", "GPT relay must use HTTP or HTTPS.");
	}
	if (!isLoopback(parsed.hostname) && environment.AWTSMOOS_GPT_ALLOW_REMOTE_RELAY !== "1") {
		throw policyError("GPT_RELAY_REMOTE_FORBIDDEN", "Remote GPT relay URLs require explicit operator approval.");
	}
	parsed.pathname = parsed.pathname.replace(/\/+$/, "");
	parsed.search = "";
	parsed.hash = "";
	return parsed.href.replace(/\/+$/, "");
}

function isLoopback(hostname) {
	return hostname === "127.0.0.1"
		|| hostname === "localhost"
		|| hostname === "::1"
		|| hostname === "[::1]";
}

function policyError(code, message) {
	const error = new Error(message);
	error.code = code;
	error.status = 503;
	return error;
}

module.exports = { resolveRelayBaseUrl, DEFAULT_RELAY, isLoopback };
