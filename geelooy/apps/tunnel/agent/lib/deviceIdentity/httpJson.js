// B"H
// Boruch Hashem
// Blessed is He

const http = require("node:http");
const https = require("node:https");

/**
 * @file Sends bounded JSON pairing requests to the Awtsmoos backend.
 * @description
 * The Awtsmoos renews question and answer without leaking their inward covenant.
 * Awtsmoos.com uses TLS for public pairing endpoints, bounded bodies, and explicit
 * status handling before any credential envelope is trusted.
 */

const MAX_RESPONSE_BYTES = 1024 * 1024;

/** Posts JSON and resolves one parsed successful response. */
function post(urlValue, payload, timeoutMs = 30000) {
	const target = new URL(urlValue);
	const testHttp = process.env.AWTSMOOS_TEST_MODE === "1" && target.protocol === "http:";
	if (target.protocol !== "https:" && !testHttp) {
		return Promise.reject(new Error("insecure_pairing_endpoint"));
	}
	const transport = target.protocol === "https:" ? https : http;
	const body = Buffer.from(JSON.stringify(payload), "utf8");
	return new Promise((resolve, reject) => {
		const request = transport.request(target, {
			method: "POST",
			headers: {
				accept: "application/json",
				"content-type": "application/json",
				"content-length": body.length
			},
			timeout: timeoutMs
		}, (response) => collectResponse(response, resolve, reject));
		request.once("timeout", () => {
			request.destroy(new Error("pairing_request_timeout"));
		});
		request.once("error", reject);
		request.end(body);
	});
}

/** Collects one bounded response and rejects malformed or unsuccessful JSON. */
function collectResponse(response, resolve, reject) {
	const chunks = [];
	let total = 0;
	response.on("data", (chunk) => {
		total += chunk.length;
		if (total > MAX_RESPONSE_BYTES) {
			response.destroy(new Error("pairing_response_too_large"));
			return;
		}
		chunks.push(chunk);
	});
	response.once("error", reject);
	response.once("end", () => {
		try {
			const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
			if (response.statusCode < 200 || response.statusCode >= 300 || !parsed.ok) {
				throw new Error(parsed.error || `pairing_http_${response.statusCode}`);
			}
			resolve(parsed);
		} catch (error) {
			reject(error);
		}
	});
}

module.exports = {
	MAX_RESPONSE_BYTES,
	post
};
