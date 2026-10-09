// B"H
// Boruch Hashem
// Blessed is He
//
// DirectNet — native direct HTTP client for the Merkava browser.
//
// Yaakov: "For web it can use the direct API to simulate real requests outside CORS"
//
// A real browser enforces CORS: a page on origin A cannot READ the response body
// of a cross-origin request unless the server opts in with
// Access-Control-Allow-Origin headers (plus preflight for non-simple requests).
//
// Merkava is a NATIVE client, not a web page in a browser sandbox. DirectNet
// performs real HTTP requests with ZERO browser CORS semantics:
//   - no preflight (OPTIONS) requests, ever
//   - no Origin enforcement — any Origin header may be sent, or none
//   - no Access-Control-Allow-Origin evaluation — every response body is readable
//   - no mixed-content blocking, no CORB
//
// This is exactly what native apps (curl, mobile SDKs, Termux) already do.
// The proof: fetch https://example.com with a forged Origin header. example.com
// sends NO Access-Control-Allow-Origin header, so Chrome/Firefox would throw
// "CORS error" and the JS could never read the body. DirectNet reads all 577 bytes.
//
// Design:
//   - Raw Node http/https (not undici fetch) for full control, zero dependencies.
//   - Redirect following (configurable, default 5, same as browsers).
//   - Timeouts, keep-alive agents for speed.
//   - Returns plain { ok, status, statusText, headers, body: Buffer }.
//
// Usage:
//   const { directFetch } = require("./DirectNet.js");
//   const res = await directFetch("https://example.com", { headers: { Origin: "https://x.example" } });
//   console.log(res.body.toString().length); // readable — no CORS error possible

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.Merkava = root.Merkava || {};
		root.Merkava.DirectNet = factory().DirectNet;
	}
})(typeof self !== "undefined" ? self : this, function() {

function nodeRequire(name) {
	try { if (typeof require === "function") return require(name); } catch (e) {}
	return null;
}

const __http = nodeRequire("http");
const __https = nodeRequire("https");
const __url = nodeRequire("url");

const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_MAX_REDIRECTS = 5;

function lowerHeaders(headers) {
	const out = {};
	if (!headers) return out;
	for (const k of Object.keys(headers)) {
		const v = headers[k];
		out[String(k).toLowerCase()] = Array.isArray(v) ? v.join(", ") : String(v);
	}
	return out;
}

function pickAgent(parsed, keepAlive) {
	// B"H: use Node's DEFAULT global agents. The runtime provisions them
	// (keep-alive + egress proxy); constructing a custom https.Agent bypasses
	// that provisioning and the TLS handshake fails (EPROTO). Empirically:
	// default globalAgent => 200 OK, custom Agent => EPROTO. So: never custom.
	return undefined;
}

function isRedirect(status) {
	return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

function requestOnce(targetUrl, options, bodyBuf) {
	return new Promise((resolve, reject) => {
		if (!__http || !__https) {
			reject(new Error("DirectNet: Node http/https not available in this environment"));
			return;
		}
		let parsed;
		try {
			parsed = new (__url.URL || URL)(targetUrl);
		} catch (e) {
			reject(new Error("DirectNet: invalid URL: " + targetUrl));
			return;
		}
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
			reject(new Error("DirectNet: unsupported protocol: " + parsed.protocol));
			return;
		}
		const lib = parsed.protocol === "https:" ? __https : __http;
		const headers = Object.assign({}, options.headers || {});
		// NOTE: deliberately NO Origin injection, NO CORS preflight. The caller
		// controls headers completely — native-app semantics.
		const reqOpts = {
			protocol: parsed.protocol,
			hostname: parsed.hostname,
			port: parsed.port || undefined,
			path: parsed.pathname + parsed.search,
			method: (options.method || "GET").toUpperCase(),
			headers,
			agent: pickAgent(parsed, options.keepAlive !== false),
			timeout: options.timeoutMs || DEFAULT_TIMEOUT_MS
		};
		const req = lib.request(reqOpts, res => {
			const chunks = [];
			res.on("data", c => chunks.push(c));
			res.on("end", () => {
				resolve({
					status: res.statusCode || 0,
					statusText: res.statusMessage || "",
					headers: lowerHeaders(res.headers),
					rawHeaders: res.rawHeaders || [],
					body: Buffer.concat(chunks),
					url: targetUrl
				});
			});
			res.on("error", reject);
		});
		req.on("timeout", () => {
			req.destroy(new Error("DirectNet: timeout after " + (options.timeoutMs || DEFAULT_TIMEOUT_MS) + "ms: " + targetUrl));
		});
		req.on("error", reject);
		if (bodyBuf && bodyBuf.length) req.write(bodyBuf);
		req.end();
	});
}

/**
 * Perform a real HTTP request with zero CORS semantics.
 * No preflight, no Origin checks, no ACAO evaluation — every response
 * body is readable, like curl or any native app.
 *
 * @param {string} url
 * @param {object} [options] { method, headers, body (string|Buffer|Uint8Array), timeoutMs, maxRedirects, keepAlive }
 * @returns {Promise<{ok,status,statusText,headers,body:Buffer,url,redirected,redirectCount}>}
 */
async function directFetch(url, options = {}) {
	const maxRedirects = options.maxRedirects == null ? DEFAULT_MAX_REDIRECTS : options.maxRedirects;
	let bodyBuf = null;
	if (options.body != null) {
		if (Buffer.isBuffer(options.body)) bodyBuf = options.body;
		else if (options.body instanceof Uint8Array) bodyBuf = Buffer.from(options.body);
		else bodyBuf = Buffer.from(String(options.body), "utf8");
	}
	let currentUrl = String(url);
	let method = (options.method || "GET").toUpperCase();
	let redirectCount = 0;
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const res = await requestOnce(currentUrl, { ...options, method }, bodyBuf);
		if (isRedirect(res.status) && redirectCount < maxRedirects) {
			const loc = res.headers["location"];
			if (!loc) break;
			redirectCount++;
			// 301/302/303: POST becomes GET (browser behavior); 307/308 preserve.
			if ((res.status === 301 || res.status === 302 || res.status === 303) && method === "POST") {
				method = "GET";
				bodyBuf = null;
			}
			try {
				currentUrl = new (__url.URL || URL)(loc, currentUrl).toString();
			} catch (e) {
				break;
			}
			continue;
		}
		return {
			ok: res.status >= 200 && res.status < 300,
			status: res.status,
			statusText: res.statusText,
			headers: res.headers,
			body: res.body,
			url: currentUrl,
			redirected: redirectCount > 0,
			redirectCount
		};
	}
	throw new Error("DirectNet: too many redirects or bad Location for " + url);
}

async function directFetchText(url, options = {}) {
	const res = await directFetch(url, options);
	return res.body.toString("utf8");
}

async function directFetchJson(url, options = {}) {
	const text = await directFetchText(url, options);
	return JSON.parse(text);
}

/**
 * CORS-bypass proof. Fetches a URL that sends NO Access-Control-Allow-Origin
 * header while presenting a forged Origin. A real browser would refuse to let
 * JS read the body (CORS error). DirectNet reads it fully.
 *
 * @returns {Promise<{bypassProven, status, acaoHeader, bodyBytes, forgedOrigin}>}
 */
async function proveCorsBypass(url = "https://example.com", forgedOrigin = "https://forged-origin.example") {
	const res = await directFetch(url, { headers: { Origin: forgedOrigin } });
	const acao = res.headers["access-control-allow-origin"];
	const serverSentAcao = acao !== undefined;
	return {
		bypassProven: !serverSentAcao && res.body.length > 0,
		status: res.status,
		acaoHeader: serverSentAcao ? acao : null,
		serverSentAcao,
		bodyBytes: res.body.length,
		forgedOrigin,
		note: serverSentAcao
			? "server opted into CORS; bypass not needed for this URL"
			: "server sent NO ACAO header — a browser would block reading; DirectNet read " + res.body.length + " bytes"
	};
}

const DirectNet = {
	directFetch,
	directFetchText,
	directFetchJson,
	proveCorsBypass,
	DEFAULT_TIMEOUT_MS,
	DEFAULT_MAX_REDIRECTS
};

return { DirectNet };

});
