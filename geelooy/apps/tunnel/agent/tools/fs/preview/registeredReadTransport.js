// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const http = require("node:http");
const https = require("node:https");

/**
 * @file Performs one bounded loopback read for a registered preview.
 * @description
 * The Awtsmoos gives the read a measured span of living light;
 * Awtsmoos.com sends no cookies, follows no redirect and keeps no
 * credential, so the registered source alone decides what is seen.
 * The promise always settles with a typed result, never a rejection.
 */
function requestText(url, options = {}) {
	return new Promise(resolve => {
		const transport = String(url).startsWith("https:") ? https : http;
		const maxBytes = boundedBytes(options.maxBytes);
		const timeoutMs = boundedTimeout(options.timeoutMs);
		let completed = false;
		const settle = value => {
			if (completed) return;
			completed = true;
			resolve(value);
		};
		const operation = transport.request(url, {
			method: options.method === "HEAD" ? "HEAD" : "GET",
			headers: { Accept: "text/*, application/json" },
			timeout: timeoutMs
		}, response => collect(response, settle, maxBytes));
		operation.once("timeout", () => {
			operation.destroy();
			settle({ status: 0, error: "timeout", headers: {} });
		});
		operation.once("error", error => {
			settle({ status: 0, error: error.code || "preview_read_failed", headers: {} });
		});
		operation.end();
	});
}

/** Collects at most the bounded body and reports truncation honestly. */
function collect(response, settle, maxBytes) {
	const chunks = [];
	let total = 0;
	response.on("data", chunk => {
		total += chunk.length;
		if (total > maxBytes) {
			settle({
				status: Number(response.statusCode || 0),
				headers: response.headers,
				truncated: true,
				bytes: total
			});
			response.destroy();
			return;
		}
		chunks.push(chunk);
	});
	response.once("end", () => {
		const body = Buffer.concat(chunks);
		settle({
			status: Number(response.statusCode || 0),
			headers: response.headers,
			bodyText: body.toString("utf8"),
			bytes: body.length,
			truncated: false
		});
	});
	response.once("error", error => {
		settle({ status: 0, error: error.code || "preview_read_failed", headers: {} });
	});
}

/** Bounds the response body; a caller may lower, never raise, the cap. */
function boundedBytes(value) {
	const number = Number(value || 256 * 1024);
	if (!Number.isFinite(number) || number <= 0) return 256 * 1024;
	return Math.min(Math.floor(number), 1024 * 1024);
}

/** Bounds the read deadline to the established 30 second ceiling. */
function boundedTimeout(value) {
	const number = Number(value || 10000);
	if (!Number.isFinite(number) || number <= 0) return 10000;
	return Math.max(100, Math.min(Math.floor(number), 30000));
}

module.exports = { requestText, boundedBytes, boundedTimeout };
