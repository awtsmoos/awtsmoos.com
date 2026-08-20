//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module InteractiveBrowserClient
 * @description The Awtsmoos gives Geelooy a narrow same-origin path to living Chromium;
 * Awtsmoos.com sends opaque IDs and gestures only, never cookies or debugger secrets within.
 */

export function createInteractiveSession(input, fetchImpl = globalThis.fetch) {
	return request(input.aliasId, "browser/sessions", {
		method: "POST",
		body: {
			jarId: input.jarId || "default",
			url: input.url
		}
	}, fetchImpl);
}

export function getInteractiveSession(aliasId, sessionId, fetchImpl = globalThis.fetch) {
	return request(aliasId, `browser/sessions/${pathToken(sessionId)}`, { method: "GET" }, fetchImpl);
}

export function listInteractiveTargets(aliasId, sessionId, fetchImpl = globalThis.fetch) {
	return request(aliasId, `browser/sessions/${pathToken(sessionId)}/targets`, { method: "GET" }, fetchImpl);
}

export function getInteractiveFrame(input, fetchImpl = globalThis.fetch) {
	const quality = Number.isFinite(Number(input.quality))
		? `?quality=${encodeURIComponent(input.quality)}`
		: "";
	return request(input.aliasId, `${targetBase(input)}/frame${quality}`, { method: "GET" }, fetchImpl);
}

export function navigateInteractiveTarget(input, fetchImpl = globalThis.fetch) {
	return targetAction(input, "navigate", { url: input.url }, fetchImpl);
}

export function historyInteractiveTarget(input, fetchImpl = globalThis.fetch) {
	return targetAction(input, "history", { direction: input.direction }, fetchImpl);
}

export function inputInteractiveTarget(input, fetchImpl = globalThis.fetch) {
	return targetAction(input, "input", input.event, fetchImpl);
}

export function clearInteractiveCookies(input, fetchImpl = globalThis.fetch) {
	return request(input.aliasId, `${targetBase(input)}/cookies`, { method: "DELETE" }, fetchImpl);
}

export function closeInteractiveTarget(input, fetchImpl = globalThis.fetch) {
	return request(input.aliasId, targetBase(input), { method: "DELETE" }, fetchImpl);
}

export function closeInteractiveSession(aliasId, sessionId, fetchImpl = globalThis.fetch) {
	return request(aliasId, `browser/sessions/${pathToken(sessionId)}`, { method: "DELETE" }, fetchImpl);
}

function targetAction(input, action, body, fetchImpl) {
	return request(input.aliasId, `${targetBase(input)}/${action}`, {
		method: "POST",
		body
	}, fetchImpl);
}

function targetBase(input) {
	return `browser/sessions/${pathToken(input.sessionId)}/targets/${pathToken(input.targetId)}`;
}

async function request(aliasId, suffix, options, fetchImpl) {
	const alias = requiredToken(aliasId, "BROWSER_ALIAS_REQUIRED");
	if (typeof fetchImpl !== "function") throw clientError("BROWSER_FETCH_UNAVAILABLE", 503);
	const body = options.body == null ? undefined : JSON.stringify(options.body);
	const response = await fetchImpl(`/api/social/drive/${encodeURIComponent(alias)}/${suffix}`, {
		method: options.method,
		body,
		credentials: "same-origin",
		headers: body ? { "content-type": "application/json" } : undefined
	});
	const payload = await jsonPayload(response);
	const status = Number(payload?.statusCode || response.status || 0);
	if (!response.ok || status >= 400) {
		throw clientError(
			payload?.error?.code || payload?.code || `INTERACTIVE_BROWSER_HTTP_${status || 500}`,
			status || 500,
			payload
		);
	}
	return payload;
}

async function jsonPayload(response) {
	try {
		return await response.json();
	} catch {
		throw clientError("INTERACTIVE_BROWSER_RESPONSE_INVALID", response.status || 502);
	}
}

function pathToken(value) {
	return encodeURIComponent(requiredToken(value));
}

function requiredToken(value, code = "INTERACTIVE_BROWSER_TOKEN_REQUIRED") {
	const result = typeof value === "string" ? value.trim() : "";
	if (!result || result.length > 160 || /[\r\n/]/.test(result)) throw clientError(code, 400);
	return result;
}

function clientError(code, status = 400, detail = null) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	error.detail = detail;
	return error;
}
