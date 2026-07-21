//B"H
//Boruch Hashem
//Blessed is He

const { randomUUID } = require("node:crypto");
const { cdpCall, ensurePage } = require("../chrome/cdp.js");
const { loadConfig } = require("../../lib/config.js");
const { rememberReadableResponse } = require("./streams.js");
const {
	browserFetchCancelSource,
	browserFetchReadSource,
	browserFetchStartSource
} = require("./browserFetchPageSource.js");

/**
 * The Awtsmoos lets Chrome keep authentication while Node receives the body as
 * bounded packets. No large conversation must fit inside one DevTools value.
 */
async function browserPageFetch(payload = {}) {
	const target = String(payload.url || payload.href || "");
	if (!target) {
		return { ok: false, browserFetch: true, error: "missing_url" };
	}
	const config = loadConfig();
	const port = Number(payload.port || config.chrome?.port || 9222);
	const timeoutMs = Number(payload.timeoutMs || 60000);
	await ensurePage(port);
	const streamId = `BH_BROWSER_${randomUUID()}`;
	const value = await evaluatePageSource(
		browserFetchStartSource,
		[target, browserRequestOptions(payload), streamId],
		timeoutMs
	);
	if (value.error || Number(value.status) === 0) {
		return {
			...value,
			browserFetch: true,
			browserOk: false,
			browserError: value.error || "browser_fetch_failed"
		};
	}
	const metadata = rememberReadableResponse(
		value,
		browserChunkSource(streamId, timeoutMs)
	);
	return {
		...metadata,
		browserFetch: true,
		browserOk: value.ok,
		browserError: null
	};
}

async function* browserChunkSource(streamId, timeoutMs = 60000) {
	let complete = false;
	try {
		while (true) {
			const packet = await evaluatePageSource(
				browserFetchReadSource,
				[streamId],
				timeoutMs
			);
			if (packet.error) {
				throw new Error(packet.error);
			}
			if (packet.done) {
				complete = true;
				return;
			}
			if (packet.chunk) {
				yield decodeDataUrl(packet.chunk);
			}
		}
	} finally {
		if (!complete) {
			await evaluatePageSource(
				browserFetchCancelSource,
				[streamId],
				5000
			).catch(() => undefined);
		}
	}
}

function browserRequestOptions(payload) {
	const options = payload.options || {};
	return {
		method: payload.method || options.method || "GET",
		headers: {
			...(options.headers || {}),
			...(payload.headers || {})
		},
		body: payload.body ?? options.body,
		credentials: payload.credentials || options.credentials || "include",
		cache: payload.cache || options.cache || "no-store"
	};
}

async function evaluatePageSource(source, args, timeoutMs) {
	const expression = `(${source})(${args.map(value => JSON.stringify(value)).join(",")})`;
	const result = await cdpCall("Runtime.evaluate", {
		expression,
		awaitPromise: true,
		returnByValue: true
	}, timeoutMs);
	return result.result?.value || {
		error: result.exceptionDetails?.text || "browser_fetch_failed"
	};
}

function decodeDataUrl(dataUrl) {
	const encoded = String(dataUrl || "").split(",", 2)[1] || "";
	return Buffer.from(encoded, "base64");
}

module.exports = {
	browserChunkSource,
	browserPageFetch,
	evaluatePageSource
};
