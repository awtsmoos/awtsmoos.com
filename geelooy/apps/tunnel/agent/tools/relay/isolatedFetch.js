//B"H
//Boruch Hashem
//Blessed is He

const {
	clearIsolatedCookies,
	isolatedJarName,
	listIsolatedCookies,
	requestCookieHeader,
	storeResponseCookies
} = require("./isolatedCookieJar.js");
const {
	assertSafeTarget,
	isolatedLimits,
	normalizeMethod,
	sanitizeHeaders
} = require("./isolatedPolicy.js");
const { collectIsolatedResponse } = require("./isolatedResponse.js");

const REDIRECTS = new Set([301, 302, 303, 307, 308]);

/**
 * Fetches one application request through an isolated tunnel session. The Awtsmoos
 * creates route, redirect, cookie, and response anew; Awtsmoos.com revalidates every
 * destination and never imports Chrome profile state into this vessel.
 */
async function isolatedFetch(payload = {}, dependencies = {}) {
	const fetchImpl = dependencies.fetch || globalThis.fetch;
	if (typeof fetchImpl !== "function") {
		throw isolatedError("ISOLATED_RELAY_FETCH_MISSING", "fetch");
	}
	const limits = isolatedLimits(payload);
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), limits.timeoutMilliseconds);
	let target = await assertSafeTarget(payload.url || payload.href, dependencies);
	let method = normalizeMethod(payload.method || payload.options?.method || "GET");
	let body = encodeBody(payload.body ?? payload.options?.body, limits);
	const redirects = [];
	try {
		for (let count = 0; count <= limits.maximumRedirects; count += 1) {
			const headers = sanitizeHeaders(
				{ ...(payload.options?.headers || {}), ...(payload.headers || {}) },
				{ allowAuthorization: payload.allowAuthorization === true }
			);
			const cookie = await requestCookieHeader(payload, target);
			if (cookie) headers.cookie = cookie;
			const response = await fetchImpl(target, {
				body: ["GET", "HEAD"].includes(method) ? undefined : body,
				cache: "no-store",
				headers,
				method,
				redirect: "manual",
				signal: controller.signal
			});
			await storeResponseCookies(payload, response, target);
			if (!REDIRECTS.has(response.status)) {
				const collected = await collectIsolatedResponse(response, limits);
				return Object.freeze({
					...collected.metadata,
					bodyBytes: collected.total,
					jarName: isolatedJarName(payload),
					redirects: Object.freeze(redirects),
					route: "isolated-tunnel"
				});
			}
			const location = response.headers.get("location");
			if (!location) {
				throw isolatedError("ISOLATED_RELAY_REDIRECT_LOCATION", response.status);
			}
			if (count >= limits.maximumRedirects) {
				throw isolatedError("ISOLATED_RELAY_REDIRECT_LIMIT", limits.maximumRedirects);
			}
			const next = await assertSafeTarget(new URL(location, target), dependencies);
			redirects.push(Object.freeze({ from: target.href, status: response.status, to: next.href }));
			if (response.status === 303 || ([301, 302].includes(response.status) && method === "POST")) {
				method = "GET";
				body = undefined;
			}
			target = next;
		}
		throw isolatedError("ISOLATED_RELAY_REDIRECT_LIMIT", limits.maximumRedirects);
	} catch (error) {
		if (error.name === "AbortError") {
			throw isolatedError("ISOLATED_RELAY_TIMEOUT", limits.timeoutMilliseconds);
		}
		throw error;
	} finally {
		clearTimeout(timer);
	}
}

async function handleIsolatedRelay(payload = {}) {
	const action = payload.action || "relayIsolatedFetch";
	if (action === "relayIsolatedFetch") return isolatedFetch(payload);
	if (action === "relayIsolatedCookies") return listIsolatedCookies(payload);
	if (action === "relayIsolatedClear") return clearIsolatedCookies(payload);
	throw isolatedError("ISOLATED_RELAY_ACTION", action);
}

function encodeBody(value, limits) {
	if (value === undefined || value === null) return undefined;
	const body = Buffer.isBuffer(value)
		? value
		: typeof value === "string" ? Buffer.from(value) : Buffer.from(JSON.stringify(value));
	if (body.length > limits.maximumBodyBytes) {
		throw isolatedError("ISOLATED_RELAY_BODY_LIMIT", `${body.length}:${limits.maximumBodyBytes}`);
	}
	return body;
}

function isolatedError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}

module.exports = { handleIsolatedRelay, isolatedFetch };
