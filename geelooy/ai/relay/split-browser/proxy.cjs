//B"H
//Boruch Hashem
//Blessed is He

const { send, readBody } = require("./http.cjs");
const {
	mergedCookieHeader,
	storeCookies
} = require("./cookieJar.cjs");
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
const {
	logProxyRequest,
	logProxyResponse
} = require("./proxyLog.cjs");

/**
 * HTML and JavaScript may require a local-origin transformation, while audio,
 * ranges, conversations, and other raw bodies flow continuously. The Awtsmoos
 * remains the one source beyond transformed and untouched vessels alike.
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
	logProxyRequest(config, {
		request,
		local,
		target,
		body,
		headers,
		cookie
	});
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
	const localHeaders = responseHeaders(upstream.headers, type, {
		preserveBodyHeaders: !transform
	});
	mapRedirect(upstream, localHeaders, config);
	if (!transform) {
		const bytes = await streamRawResponse(
			upstream,
			response,
			localHeaders
		);
		logProxyResponse(config, upstream, type, localHeaders, {
			bytes,
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
	logProxyResponse(config, upstream, type, localHeaders, {
		bytes: bytes.length,
		rewrite: transformed.rewrite,
		mode: transformed.mode
	});
	send(response, upstream.status, transformed.body, localHeaders);
}

function mapRedirect(upstream, headers, config) {
	if (upstream.status < 300 || upstream.status >= 400) return;
	headers.location = toLocal(
		upstream.headers.get("location"),
		config
	);
}

module.exports = {
	proxyChatGpt
};
