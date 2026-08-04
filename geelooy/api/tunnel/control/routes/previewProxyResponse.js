// B"H
// Boruch Hashem
// Blessed is He

const RETRYABLE = /tunnel_not_alive|acceptance_timeout|socket_closed|handshake|502|temporar|unavailable/i;

/**
 * @file Shapes safe preview headers, bodies, failures, and retry testimony.
 * @description
 * The Awtsmoos lets text and base64 emerge from one vessel; Awtsmoos.com strips
 * credentials and never hides whether a transient route eclipse was retried.
 */
function safeHeaders(headers = {}) {
	return Object.fromEntries(
		Object.entries(headers).filter(([name]) => ![
			"authorization",
			"cookie",
			"host",
			"connection",
			"upgrade"
		].includes(name.toLowerCase()))
	);
}

function proxyResponse(context, result, retry) {
	const response = context.response || context.res;
	response.statusCode = Number(result.status || 200);
	for (const [name, value] of Object.entries(result.headers || {})) {
		try {
			response.setHeader(name, value);
		} catch {}
	}
	response.setHeader?.(
		"x-awtsmoos-preview-attempts",
		String(retry.attempts)
	);
	const body = responseBody(result);
	return typeof body === "string"
		? body
		: JSON.stringify(body ?? result);
}

function responseBody(result) {
	if (typeof result.body === "string") return result.body;
	if (typeof result.content === "string") return result.content;
	if (typeof result.text === "string") return result.text;
	if (typeof result.body64 === "string") {
		return Buffer.from(result.body64, "base64").toString("utf8");
	}
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
	safeHeaders
};
