//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AwtsmoosBrowserProxyClient
 * @description
 * The Awtsmoos gives the OS browser one explicit authenticated alias doorway.
 * Awtsmoos.com reroutes remote bytes while cookie authority stays server-side and
 * optional request bodies cross only when the caller deliberately supplies them.
 */

export async function fetchRemotePage(input, fetchImpl = globalThis.fetch) {
	return proxyRequest(input.aliasId, "browser/fetch", {
		method: "POST",
		body: JSON.stringify(fetchPayload(input))
	}, fetchImpl);
}

export async function listRemoteJars(aliasId, fetchImpl = globalThis.fetch) {
	return proxyRequest(aliasId, "browser/jars", { method: "GET" }, fetchImpl);
}

export async function clearRemoteJar(aliasId, jarId, fetchImpl = globalThis.fetch) {
	const id = requiredToken(jarId, "BROWSER_JAR_ID_REQUIRED");
	return proxyRequest(aliasId, `browser/jars/${encodeURIComponent(id)}`, {
		method: "DELETE"
	}, fetchImpl);
}

function fetchPayload(input) {
	const payload = {
		url: input.url,
		method: input.method || "GET",
		headers: safeRemoteHeaders(input.headers),
		jarId: input.jarId || "default",
		projectId: input.projectId || null,
		initiatorUrl: input.initiatorUrl || null
	};
	if (input.bodyBase64 != null) {
		payload.bodyBase64 = String(input.bodyBase64);
	} else if (input.body != null) {
		payload.body = String(input.body);
	}
	return payload;
}

function safeRemoteHeaders(headers) {
	const output = {};
	for (const [name, value] of Object.entries(headers || {})) {
		const normalized = String(name).toLowerCase();
		if (normalized === "cookie" || normalized === "set-cookie") continue;
		output[name] = String(value);
	}
	return output;
}

async function proxyRequest(aliasId, suffix, options, fetchImpl) {
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

async function jsonPayload(response) {
	try {
		return await response.json();
	} catch {
		throw clientError("BROWSER_PROXY_RESPONSE_INVALID", response.status || 502);
	}
}

function requiredToken(value, code) {
	const token = typeof value === "string" ? value.trim() : "";
	if (!token || token.length > 128 || /[\r\n/]/.test(token)) {
		throw clientError(code, 400);
	}
	return token;
}

function clientError(code, status = 400, detail = null, retryAfter = null) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	error.detail = detail;
	error.retryAfter = retryAfter;
	return error;
}
