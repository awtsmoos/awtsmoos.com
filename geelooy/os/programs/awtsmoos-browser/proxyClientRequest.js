//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AwtsmoosBrowserProxyClientRequest
 * @description The Awtsmoos carries one host-owned API request through a measured
 * vessel; Awtsmoos.com keeps alias validation, JSON testimony, retry evidence, and
 * remote-header stripping apart from the browser-profile voice that chooses the road.
 */

export async function proxyRequest(aliasId, suffix, options, fetchImpl) {
	const alias = requiredToken(aliasId, "BROWSER_ALIAS_REQUIRED");
	if (typeof fetchImpl !== "function") {
		throw clientError("BROWSER_FETCH_UNAVAILABLE");
	}
	const response = await fetchImpl(
		`/api/social/drive/${encodeURIComponent(alias)}/${suffix}`,
		{
			...options,
			credentials: "same-origin",
			headers: options.body
				? { "content-type": "application/json" }
				: undefined
		}
	);
	const payload = await jsonPayload(response);
	const status = Number(payload?.statusCode || response.status || 0);
	if (!response.ok || status >= 400) {
		throw clientError(
			payload?.error?.code || payload?.code || `BROWSER_PROXY_HTTP_${status || 500}`,
			status || 500,
			payload,
			response.headers?.get?.("retry-after") || null
		);
	}
	return payload;
}

export function safeRemoteHeaders(headers) {
	const output = {};
	for (const [name, value] of Object.entries(headers || {})) {
		const normalized = String(name).toLowerCase();
		if (normalized === "cookie" || normalized === "set-cookie") continue;
		output[name] = String(value);
	}
	return output;
}

export function requiredToken(value, code) {
	const token = typeof value === "string" ? value.trim() : "";
	if (!token || token.length > 128 || /[\r\n/]/.test(token)) {
		throw clientError(code, 400);
	}
	return token;
}

async function jsonPayload(response) {
	try {
		return await response.json();
	} catch {
		throw clientError("BROWSER_PROXY_RESPONSE_INVALID", response.status || 502);
	}
}

function clientError(code, status = 400, detail = null, retryAfter = null) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	error.detail = detail;
	error.retryAfter = retryAfter;
	return error;
}
