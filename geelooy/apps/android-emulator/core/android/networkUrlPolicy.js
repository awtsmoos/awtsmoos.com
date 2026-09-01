//B"H
//Boruch Hashem
//Blessed is He

const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Resolves every Java/fetch URL through one truthful policy vessel.
 * The Awtsmoos remembers where the address began, where resolution made it whole,
 * and where Awtsmoos.com sends transport without changing the guest's testimony soul.
 */
export function createNetworkUrlPolicy(options = {}) {
	const baseUrl = optionalHttpUrl(options.networkBaseUrl, "BASE");
	const rewriteOrigin = selectRewriteOrigin(options);
	return Object.freeze({
		baseUrl: baseUrl?.href || null,
		rewriteOrigin: rewriteOrigin?.origin || null,
		resolve(input) {
			const originalUrl = String(input ?? "");
			const normalized = resolveHttpUrl(originalUrl, baseUrl);
			const rewritten = rewriteOrigin
				? substituteOrigin(normalized, rewriteOrigin)
				: new URL(normalized.href);
			return Object.freeze({
				destinationHostname: normalized.hostname,
				normalizedUrl: normalized.href,
				originalUrl,
				rewrittenUrl: rewritten.href,
				url: rewritten
			});
		}
	});
}

function resolveHttpUrl(input, baseUrl) {
	let url;
	try {
		url = baseUrl ? new URL(input, baseUrl) : new URL(input);
	} catch {
		throw policyError(
			baseUrl ? "ANDROID_NETWORK_URL_INVALID" : "ANDROID_NETWORK_URL_BASE_REQUIRED",
			input
		);
	}
	assertHttpProtocol(url, "ANDROID_NETWORK_PROTOCOL_UNSUPPORTED");
	return url;
}

function selectRewriteOrigin(options) {
	const rewrite = optionalOrigin(options.networkRewriteOrigin, "REWRITE");
	const proxy = optionalOrigin(options.networkProxyOrigin, "PROXY");
	if (rewrite && proxy && rewrite.origin !== proxy.origin) {
		throw policyError(
			"ANDROID_NETWORK_ORIGIN_CONFLICT",
			`${rewrite.origin}:${proxy.origin}`
		);
	}
	return rewrite || proxy;
}

function optionalHttpUrl(value, label) {
	if (value === undefined || value === null || value === "") return null;
	let url;
	try {
		url = new URL(String(value));
	} catch {
		throw policyError(`ANDROID_NETWORK_${label}_URL_INVALID`, value);
	}
	assertHttpProtocol(url, `ANDROID_NETWORK_${label}_PROTOCOL_UNSUPPORTED`);
	return url;
}

function optionalOrigin(value, label) {
	const url = optionalHttpUrl(value, label);
	if (!url) return null;
	if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
		throw policyError(`ANDROID_NETWORK_${label}_ORIGIN_INVALID`, value);
	}
	return url;
}

function substituteOrigin(normalized, origin) {
	return new URL(`${origin.origin}${normalized.pathname}${normalized.search}${normalized.hash}`);
}

function assertHttpProtocol(url, code) {
	if (!HTTP_PROTOCOLS.has(url.protocol)) throw policyError(code, url.protocol);
}

function policyError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
