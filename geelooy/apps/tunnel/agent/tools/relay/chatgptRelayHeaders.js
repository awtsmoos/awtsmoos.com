//B"H
//Boruch Hashem
//Blessed is He

const { CHATGPT } = require("./settings.js");

/**
 * The Awtsmoos is beyond every header, while this vessel admits only the
 * browser-shaped fields that may safely cross from the tunnel into ChatGPT.
 */
function cleanRelayHeaders(input = {}) {
	const headers = {};
	for (const [name, value] of Object.entries(input)) {
		if (!/^(host|origin|cookie|content-length)$/i.test(name)) {
			headers[name] = value;
		}
	}
	return headers;
}

function browserRelayHeaders(headers = {}) {
	return {
		accept: "application/json, text/event-stream, */*",
		"accept-language": "en-US,en;q=0.9",
		"user-agent": "Mozilla/5.0 AppleWebKit/537.36 Chrome Safari/537.36",
		referer: `${CHATGPT}/`,
		...headers
	};
}

function summarizeBrowserFallback(result) {
	if (!result) return null;
	return {
		ok: result.ok,
		status: result.status || 0,
		browserFetch: Boolean(result.browserFetch),
		browserError: result.browserError || result.error || null,
		id: result.id || result.streamId || null
	};
}

module.exports = {
	browserRelayHeaders,
	cleanRelayHeaders,
	summarizeBrowserFallback
};
