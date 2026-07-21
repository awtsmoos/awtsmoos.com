//B"H
//Boruch Hashem
//Blessed is He

const DROP_REQUEST = /^(connection|content-length|transfer-encoding|upgrade|proxy-|alt-used)$/i;
const DROP_RESPONSE_ALWAYS = /^(connection|transfer-encoding|alt-svc)$/i;
const DROP_RESPONSE_TRANSFORMED = /^(content-length|content-encoding)$/i;

/**
 * The Awtsmoos is beyond every header, while each finite vessel must faithfully
 * witness what crossed it. Request headers are copied except for hop-by-hop and
 * authority values that cannot remain localhost.
 *
 * @param {Record<string,string|string[]>} incoming Local request headers.
 * @param {string} origin Upstream origin.
 * @param {string} cookie Cookie header owned by Node.
 * @returns {Record<string,string|string[]>} Upstream headers.
 */
function upstreamHeaders(incoming, origin, cookie = "") {
	const upstream = {};
	const upstreamUrl = new URL(origin);
	for (const [key, value] of Object.entries(incoming || {})) {
		const lower = key.toLowerCase();
		if (DROP_REQUEST.test(lower) || lower === "host" || lower === "cookie") {
			continue;
		}
		upstream[lower] = rewriteHeaderValue(lower, value, origin);
	}
	upstream.host = upstreamUrl.host;
	if (cookie) {
		upstream.cookie = cookie;
	}
	if (!upstream["user-agent"]) {
		upstream["user-agent"] = browserUserAgent();
	}
	if (!upstream.accept) {
		upstream.accept = "*/*";
	}
	return upstream;
}

/**
 * Preserves byte-defining headers for untouched streams while removing them
 * when HTML or JavaScript is transformed and therefore has a new representation.
 *
 * @param {Headers} headers Upstream response headers.
 * @param {string} type Upstream content type.
 * @param {{preserveBodyHeaders?:boolean}} options Mapping options.
 * @returns {Record<string,string|string[]>} Local response headers.
 */
function responseHeaders(headers, type, options = {}) {
	const preserveBodyHeaders = options.preserveBodyHeaders === true;
	const kept = {
		"content-type": type || "application/octet-stream",
		"cache-control": "no-store"
	};
	headers.forEach((value, key) => {
		if (DROP_RESPONSE_ALWAYS.test(key)) {
			return;
		}
		if (!preserveBodyHeaders && DROP_RESPONSE_TRANSFORMED.test(key)) {
			return;
		}
		if (/^content-security-policy/i.test(key) || /^cross-origin-/i.test(key)) {
			return;
		}
		kept[key] = value;
	});
	const cookie = getSetCookie(headers);
	if (cookie.length) {
		kept["set-cookie"] = cookie;
	}
	return kept;
}

function rewriteHeaderValue(key, value, origin) {
	if (Array.isArray(value)) {
		return value.map(item => rewriteHeaderValue(key, item, origin));
	}
	const text = String(value || "");
	if (key === "origin") {
		return origin;
	}
	if (key === "referer") {
		return text
			.replace(/^https?:\/\/127\.0\.0\.1:\d+/i, origin)
			.replace(/^http:\/\/localhost:\d+/i, origin);
	}
	return text;
}

function getSetCookie(headers) {
	if (headers.getSetCookie) {
		return headers.getSetCookie();
	}
	const cookie = headers.get("set-cookie");
	return cookie ? [cookie] : [];
}

function browserUserAgent() {
	return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
		+ "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";
}

module.exports = {
	getSetCookie,
	responseHeaders,
	upstreamHeaders
};
