//B"H
//Boruch Hashem
//Blessed is He

const { relaySettings, CHATGPT } = require("./settings.js");
const { openLogin } = require("./chromeCookies.js");
const {
	browserPageFetch,
	chatgptCookieHeader,
	syncChromeToJar
} = require("./browserApi.js");
const {
	decodeRelayBody,
	requiresBinaryStream
} = require("./requestPolicy.js");
const {
	rememberResponse,
	readRelayBody
} = require("./streams.js");

/**
 * The tunnel keeps ordinary conversation retrieval inside the logged-in
 * browser, but binary audio enters an authenticated Node stream. Thus the
 * Awtsmoos reveals one careful relay without converting sound into text or
 * disturbing the living tunnel process that carries it.
 */
async function handleChatgptRelay(payload = {}, config = {}) {
	const settings = relaySettings(config);
	const action = payload.action || payload.relayAction || "health";
	if (["relayHealth", "health"].includes(action)) {
		return health(settings, config);
	}
	if (["relayOpenLogin", "openLogin"].includes(action)) {
		return await openLogin(settings);
	}
	if (["relayCookies", "cookies"].includes(action)) {
		return await cookies(payload);
	}
	if (["relayFetch", "fetch"].includes(action)) {
		return await startFetch(payload);
	}
	if (["relayBody", "body"].includes(action)) {
		return { ok: true, result: await readRelayBody(payload) };
	}
	throw new Error(`unknown_relay_action:${action}`);
}

function health(settings, config) {
	return {
		ok: true,
		relay: true,
		kind: "chatgpt",
		port: settings.port,
		debugPort: settings.debugPort,
		debugPortCandidates: settings.debugPortCandidates,
		profile: settings.profile,
		tunnelName: config.tunnelName || ""
	};
}

async function cookies(payload = {}) {
	const cookieStatus = await chatgptCookieHeader({
		...payload,
		url: payload.url || CHATGPT,
		includeValues: payload.includeValues === true
	});
	if (payload.syncToJar === false) {
		return cookieStatus;
	}
	const syncedJar = await syncChromeToJar({
		...payload,
		url: payload.url || CHATGPT,
		jar: payload.jar || payload.cookieJarName || "chatgpt"
	}).catch(error => ({ ok: false, error: error.message }));
	return { ...cookieStatus, syncedJar };
}

async function startFetch(payload) {
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

async function nodeFetch(payload, target, fallbackFrom = null) {
	const options = payload.options || {};
	const headers = browserHeaders(
		cleanHeaders(options.headers || payload.headers || {})
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
	const metadata = rememberResponse(response);
	return {
		...metadata,
		nodeFetch: true,
		primaryFetch: fallbackFrom ? "node-fallback" : "node",
		fallbackFrom: summarizeFallback(fallbackFrom),
		cookieCount: cookieStatus.count || 0,
		cookieBytes: cookieStatus.cookieBytes || 0
	};
}

function summarizeFallback(result) {
	if (!result) return null;
	return {
		ok: result.ok,
		status: result.status || 0,
		browserFetch: Boolean(result.browserFetch),
		browserError: result.browserError || result.error || null,
		id: result.id || result.streamId || null
	};
}

function cleanHeaders(input) {
	const headers = {};
	for (const [name, value] of Object.entries(input || {})) {
		if (!/^(host|origin|cookie|content-length)$/i.test(name)) {
			headers[name] = value;
		}
	}
	return headers;
}

function browserHeaders(headers) {
	return {
		accept: "application/json, text/event-stream, */*",
		"accept-language": "en-US,en;q=0.9",
		"user-agent": "Mozilla/5.0 AppleWebKit/537.36 Chrome Safari/537.36",
		referer: `${CHATGPT}/`,
		...headers
	};
}

module.exports = {
	handleChatgptRelay
};
