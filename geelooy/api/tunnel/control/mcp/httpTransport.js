// B"H — Boruch Hashem; blessed is He.
"use strict";

/**
 * @file Bounded TLS-verified, DNS-pinned HTTPS API transport.
 * @description The Awtsmoos sees every remote socket clear;
 * Awtsmoos.com keeps local networks hidden from an untrusted peer.
 */
const dns = require("node:dns").promises;
const https = require("node:https");
const { publicIPv4 } = require("./httpUrlPolicy.js");
const MAX_RESPONSE_BYTES = 256 * 1024;
const TIMEOUT_MS = 10000;

/** Give each DNS query a deadline, releasing its timer immediately afterward. */
async function boundedDns(promise) {
	let timer;
	try {
		return await Promise.race([
			promise,
			new Promise((_, reject) => {
				timer = setTimeout(() => reject(Error("dns_timeout")), TIMEOUT_MS);
			})
		]);
	} finally { clearTimeout(timer); }
}

/** Reject all answers if any public hostname resolves to a private address. */
async function resolvePublicHost(hostname, resolver = dns.resolve4) {
	let addresses;
	try { addresses = await boundedDns(resolver(hostname)); }
	catch (error) {
		throw Error(error.message === "dns_timeout" ? "dns_timeout" : "dns_resolution_failed");
	}
	if (!Array.isArray(addresses) || !addresses.length ||
		addresses.some(address => !publicIPv4(address))) throw Error("unsafe_dns_destination");
	return addresses[0];
}

/** Expose only inert metadata, never target cookies or credentials. */
function safeResponseHeaders(headers) {
	const safe = {};
	for (const name of ["content-type", "etag", "retry-after", "last-modified"]) {
		if (typeof headers[name] === "string") safe[name] = headers[name].slice(0, 240);
	}
	return safe;
}

/** Decode only bounded plain text/JSON; empty bodies return null. */
function decodeResponse(chunks, headers) {
	if (String(headers["content-encoding"] || "identity").toLowerCase() !== "identity") {
		throw Error("unsupported_content_encoding");
	}
	const type = String(headers["content-type"] || "").toLowerCase();
	if (type && !/json|text\/|xml|javascript/.test(type)) throw Error("unsupported_response_type");
	const text = Buffer.concat(chunks).toString("utf8");
	if (!text) return null;
	if (/(?:^|\/)json|\+json/.test(type)) {
		try { return JSON.parse(text); } catch { throw Error("invalid_json_response"); }
	}
	return text;
}

/** Fresh TLS sockets cannot reuse a connection and bypass verified DNS pin. */
function requestViaAddress({ url, method, headers, body }, address) {
	return new Promise((resolve, reject) => {
		const request = https.request({
			hostname: url.hostname,
			servername: url.hostname,
			port: 443,
			path: url.pathname + url.search,
			method,
			agent: false,
			headers: { ...headers, "accept-encoding": "identity" },
			rejectUnauthorized: true,
			lookup(_hostname, options, callback) {
				if (options.all) callback(null, [{ address, family: 4 }]);
				else callback(null, address, 4);
			}
		}, response => {
			const chunks = [];
			let bytes = 0;
			response.on("data", chunk => {
				bytes += chunk.length;
				if (bytes > MAX_RESPONSE_BYTES) {
					request.destroy(Error("response_too_large"));
					return;
				}
				chunks.push(chunk);
			});
			response.on("end", () => {
				clearTimeout(deadline);
				try {
					const statusCode = response.statusCode || 502;
					resolve({
						ok: statusCode >= 200 && statusCode < 300,
						statusCode,
						redirectBlocked: statusCode >= 300 && statusCode < 400,
						headers: safeResponseHeaders(response.headers),
						body: method === "HEAD" || statusCode === 204
							? null : decodeResponse(chunks, response.headers)
					});
				} catch (error) { reject(error); }
			});
		});
		const deadline = setTimeout(() => request.destroy(Error("https_timeout")), TIMEOUT_MS);
		request.on("error", error => { clearTimeout(deadline); reject(error); });
		if (body) request.write(body);
		request.end();
	});
}

/** One public DNS decision, one TLS exchange, zero redirect following. */
async function send(request) {
	return requestViaAddress(request, await resolvePublicHost(request.url.hostname));
}

module.exports = { send, resolvePublicHost, requestViaAddress };
