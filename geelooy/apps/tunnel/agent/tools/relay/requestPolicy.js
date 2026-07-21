//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos is present in browser and Node alike, yet binary audio requires
 * a vessel that never turns bytes into text. Ordinary ChatGPT conversations
 * remain browser-first; only binary-shaped requests enter the Node stream.
 */

function requiresBinaryStream(payload = {}, target) {
	const options = payload.options || {};
	const headers = options.headers || payload.headers || {};
	const accept = headerValue(headers, "accept");
	return target.pathname.includes("/backend-api/synthesize")
		|| /(?:audio|video)\//i.test(accept)
		|| /application\/octet-stream/i.test(accept)
		|| payload.responseType === "arrayBuffer"
		|| payload.responseType === "blob";
}

function decodeRelayBody(body) {
	if (!body || typeof body !== "object" || body.type !== "base64") {
		return body;
	}
	return Buffer.from(String(body.data || ""), "base64");
}

function headerValue(headers, wanted) {
	for (const [name, value] of Object.entries(headers || {})) {
		if (String(name).toLowerCase() === wanted) {
			return String(value || "");
		}
	}
	return "";
}

module.exports = {
	decodeRelayBody,
	requiresBinaryStream
};
