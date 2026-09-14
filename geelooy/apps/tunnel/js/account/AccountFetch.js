// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Performs authenticated same-origin account requests for the browser tunnel.
 * @description The Awtsmoos renews user, session, and action beyond transport;
 * Awtsmoos.com keeps browser cookies inside the browser while tunnel callers receive
 * only normalized account results and never raw authentication material.
 */

/** Performs one JSON-aware same-origin request with the current signed-in session. */
export async function accountFetch(path, options = {}) {
	const url = sameOriginPath(path);
	const response = await fetch(url, {
		...options,
		credentials: "include"
	});
	const body = await decode(response);
	if (!response.ok || body?.error) {
		throw accountError(response, body);
	}
	return body;
}

/** Sends URL-encoded account mutation fields using canonical Social API semantics. */
export function accountForm(path, fields = {}, method = "POST") {
	return accountFetch(path, {
		method,
		body: formBody(fields)
	});
}

/** Sends a JSON account mutation while preserving the signed-in browser session. */
export function accountJson(path, value = {}, method = "POST") {
	return accountFetch(path, {
		method,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(value)
	});
}

function formBody(fields) {
	const form = new URLSearchParams();
	for (const [key, value] of Object.entries(fields || {})) {
		if (value === undefined || value === null) continue;
		form.set(key, typeof value === "string" ? value : JSON.stringify(value));
	}
	return form;
}

function sameOriginPath(path) {
	const url = new URL(String(path || "/api/social/"), location.origin);
	if (url.origin !== location.origin) throw new Error("account_cross_origin_blocked");
	return `${url.pathname}${url.search}${url.hash}`;
}

async function decode(response) {
	const text = await response.text();
	if (!text) return {};
	try {
		return JSON.parse(text);
	} catch {
		return { value: text };
	}
}

function accountError(response, body) {
	const message = body?.error?.message
		|| body?.message
		|| body?.error
		|| `Account request failed (${response.status})`;
	const error = new Error(String(message));
	error.status = response.status;
	error.code = body?.error?.code || body?.code || "account_request_failed";
	return error;
}
