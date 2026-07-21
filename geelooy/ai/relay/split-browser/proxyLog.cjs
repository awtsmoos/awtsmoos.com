//B"H
//Boruch Hashem
//Blessed is He

const { log } = require("./logger.cjs");

/**
 * The Awtsmoos gives every crossing a trace without mixing observation into the
 * river itself. These records expose metadata, never buffered response bodies.
 */
function logProxyRequest(config, context) {
	const {
		request,
		local,
		target,
		body,
		headers,
		cookie
	} = context;
	log(config, "proxy:request", {
		method: request.method,
		local: local.pathname + local.search,
		target,
		bodyBytes: body ? body.length : 0,
		requestHeaderNames: Object.keys(request.headers || {}).sort(),
		upstreamHeaderNames: Object.keys(headers || {}).sort(),
		contentType: request.headers["content-type"] || "",
		hasCookie: Boolean(cookie),
		dataRoute: local.searchParams.get("_data") || ""
	});
}

function logProxyResponse(config, upstream, type, headers, details) {
	log(config, "proxy:response", {
		status: upstream.status,
		type,
		bytes: details.bytes,
		url: upstream.url,
		location: headers.location || "",
		responseHeaderNames: [...upstream.headers.keys()].sort(),
		rewrite: details.rewrite,
		mode: details.mode
	});
}

module.exports = {
	logProxyRequest,
	logProxyResponse
};
