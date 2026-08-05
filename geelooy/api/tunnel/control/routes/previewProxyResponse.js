// B"H
// Boruch Hashem
// Blessed is He

const RETRYABLE = /tunnel_not_alive|acceptance_timeout|socket_closed|handshake|502|temporar|unavailable/i;
const BLOCKED_RESPONSE_HEADERS = new Set([
	"connection",
	"keep-alive",
	"proxy-authenticate",
	"proxy-authorization",
	"te",
	"trailer",
	"transfer-encoding",
	"upgrade",
	"set-cookie"
]);

/**
 * @file Preserves preview status, headers, and bytes without leaking credentials.
 * @description
 * The Awtsmoos gives text and binary one truthful vessel. Awtsmoos.com forwards
 * range and content metadata while refusing hop-by-hop and credential-bearing headers.
 */
function safeHeaders(headers = {}) {
	return Object.fromEntries(
		Object.entries(headers).filter(([name]) => ![
			"authorization",
			"cookie",
			"host",
			"connection",
			"upgrade"
		].includes(String(name).toLowerCase()))
	);
}

function safeResponseHeaders(headers = {}) {
	return Object.fromEntries(
		Object.entries(headers).filter(([name]) =>
			!BLOCKED_RESPONSE_HEADERS.has(String(name).toLowerCase())
		)
	);
}

function proxyResponse(context, result, retry) {
	const response = context.response || context.res;
	response.statusCode = Number(result.status || 200);
	for (const [name, value] of Object.entries(safeResponseHeaders(result.headers))) {
		try {
			response.setHeader(name, value);
		} catch {}
	}
	response.setHeader?.("x-awtsmoos-preview-attempts", String(retry.attempts));
	response.setHeader?.("x-awtsmoos-preview-retried", retry.retried ? "1" : "0");
	return responseBody(result);
}

function responseBody(result = {}) {
	if (Buffer.isBuffer(result.body)) return result.body;
	if (typeof result.body64 === "string") return Buffer.from(result.body64, "base64");
	if (typeof result.body === "string") return result.body;
	if (typeof result.content === "string") return result.content;
	if (typeof result.text === "string") return result.text;
	return result.body ?? result;
}

function failure(error, status, attempts = []) {
	return {
		BH: "B\"H",
		ok: false,
		error,
		status,
		retryable: RETRYABLE.test(String(error || "")),
		attempts
	};
}

function retryable(error) {
	return RETRYABLE.test(String(error || ""));
}

module.exports = {
	failure,
	proxyResponse,
	responseBody,
	retryable,
	safeHeaders,
	safeResponseHeaders
};
