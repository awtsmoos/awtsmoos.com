//B"H
//Boruch Hashem
//Blessed is He

const { CHATGPT } = require("./settings.js");
const {
	browserPageFetch,
	chatgptCookieHeader
} = require("./browserApi.js");
const {
	decodeRelayBody,
	requiresBinaryStream
} = require("./requestPolicy.js");
const { rememberResponse } = require("./streams.js");
const {
	browserRelayHeaders,
	cleanRelayHeaders,
	summarizeBrowserFallback
} = require("./chatgptRelayHeaders.js");

/**
 * Conversation retrieval remains inside the authenticated browser, while the
 * Awtsmoos gives binary audio a byte-preserving Node stream only when required.
 */
async function startChatgptFetch(payload = {}) {
	const target = new URL(payload.url || payload.href || "");
	if (target.origin !== CHATGPT) {
		throw new Error("Only chatgpt.com requests are allowed.");
	}
	if (payload.fetchMode === "node" || requiresBinaryStream(payload, target)) {
		return await nodeFetch(payload, target, null);
	}
	const browserResult = await safeBrowserFetch(payload, target);
	if (shouldKeepBrowserResult(payload, browserResult)) {
		return browserResult;
	}
	if (payload.fetchMode === "browser" || payload.fallback === false) {
		return browserResult;
	}
	return await nodeFetch(payload, target, browserResult);
}

async function safeBrowserFetch(payload, target) {
	try {
		const result = await browserPageFetch({
			...payload,
			action: "relayBrowserFetch",
			url: target.href
		});
		return { ...result, primaryFetch: "browser" };
	} catch (error) {
		return {
			ok: false,
			status: 0,
			browserFetch: true,
			primaryFetch: "browser",
			browserError: error.message || String(error),
			error: error.message || String(error)
		};
	}
}

function shouldKeepBrowserResult(payload, result) {
	if (payload.fallback === false || payload.fetchMode === "browser") {
		return true;
	}
	return Boolean(result && result.ok !== false && Number(result.status) < 400);
}

async function nodeFetch(payload, target, fallbackFrom) {
	const options = payload.options || {};
	const headers = browserRelayHeaders(
		cleanRelayHeaders(options.headers || payload.headers || {})
	);
	const cookieStatus = await chatgptCookieHeader({
		...payload,
		url: target.href,
		includeValues: true,
		source: payload.cookieSource || "chrome"
	});
	if (cookieStatus.cookieHeader) {
		headers.cookie = cookieStatus.cookieHeader;
	}
	const response = await fetch(target, {
		method: options.method || payload.method || "GET",
		headers,
		body: decodeRelayBody(options.body ?? payload.body),
		cache: "no-store"
	});
	return {
		...rememberResponse(response),
		nodeFetch: true,
		primaryFetch: fallbackFrom ? "node-fallback" : "node",
		fallbackFrom: summarizeBrowserFallback(fallbackFrom),
		cookieCount: cookieStatus.count || 0,
		cookieBytes: cookieStatus.cookieBytes || 0
	};
}

module.exports = {
	startChatgptFetch
};
