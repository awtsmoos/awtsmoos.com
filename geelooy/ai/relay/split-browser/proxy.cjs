//B"H
//Boruch Hashem
//Blessed is He

const { send, readBody } = require("./http.cjs");
const {
	mergedCookieHeader,
	storeCookies
} = require("./cookieJar.cjs");
const { log } = require("./logger.cjs");
const {
	toUpstream,
	toLocal
} = require("./urlMap.cjs");
const {
	upstreamHeaders,
	responseHeaders,
	getSetCookie
} = require("./headerMap.cjs");
const { transformBody } = require("./bodyTransform.cjs");
const {
	shouldTransformBody,
	streamRawResponse
} = require("./responseStream.cjs");

/**
 * The proxy remains a witness rather than an author. HTML and JavaScript may
 * require a local-origin transformation, while audio, ranges, conversations,
 * and every raw body flow continuously from ChatGPT with backpressure and all
 * byte-defining headers intact.
 */
async function proxyChatGpt(request, response, config) {
	const local = new URL(request.url, "http://127.0.0.1");
	const target = toUpstream(local, config);
	const hasBody = !["GET", "HEAD"].includes(request.method);
	const body = hasBody
		? await readBody(request)
		: undefined;
	const cookie = mergedCookieHeader(request.headers.cookie);
	const headers = upstreamHeaders(
		request.headers,
		new URL(target).origin,
		cookie
	);
	logRequest(config, request, local, target, body, headers, cookie);
	const upstream = await fetch(target, {
		method: request.method,
		headers,
		body,
		redirect: "manual",
		...(hasBody ? { duplex: "half" } : {})
	});
	storeCookies(getSetCookie(upstream.headers));
	const type = upstream.headers.get("content-type")
		|| "application/octet-stream";
	const transform = shouldTransformBody(local, type);
	const responseHeaderBag = responseHeaders(upstream.headers, type, {
		preserveBodyHeaders: !transform
	});
	mapRedirect(upstream, responseHeaderBag, config);
	if (!transform) {
		const byteCount = await streamRawResponse(
			upstream,
			response,
			responseHeaderBag
		);
		logResponse(config, upstream, type, responseHeaderBag, {
			bytes: byteCount,
			rewrite: false,
			mode: "raw-stream"
		});
		return;
	}
	const bytes = Buffer.from(await upstream.arrayBuffer());
	const transformed = transformBody(
		bytes,
		type,
		local,
		new URL(target).origin
	);
	logResponse(config, upstream, type, responseHeaderBag, {
		bytes: bytes.length,
		rewrite: transformed.rewrite,
		mode: transformed.mode
	});
	send(
		response,
		upstream.status,
		transformed.body,
		responseHeaderBag
	);
}

function mapRedirect(upstream, headers, config) {
	if (upstream.status < 300 || upstream.status >= 400) {
		return;
	}
	headers.location = toLocal(
		upstream.headers.get("location"),
		config
	);
}

function logRequest(config, request, local, target, body, headers, cookie) {
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

function logResponse(config, upstream, type, headers, details) {
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
	proxyChatGpt
};
