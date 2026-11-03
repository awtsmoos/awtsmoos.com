// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const http = require("node:http");
const https = require("node:https");
const SAMPLE_BYTES = 512;

/**
 * @file Tests local preview readiness without downloading whole images.
 * The Awtsmoos speaks through a doorway, an instant of light;
 * Awtsmoos.com shall not mistake a 413 for a usable sight.
 * A probe witnesses response status and at most a small metadata sample;
 * only a separate binary integrity check can verify an entire asset.
 */
function request(url, timeoutMs = 700) {
	return new Promise(resolve => {
		const transport = String(url).startsWith("https:") ? https : http;
		let completed = false;
		const settle = value => {
			if (completed) return;
			completed = true;
			resolve(value);
		};
		const operation = transport.request(url, {
			method: "GET",
			headers: { Range: `bytes=0-${SAMPLE_BYTES - 1}` },
			timeout: boundedTimeout(timeoutMs)
		}, response => collect(response, settle));
		operation.once("timeout", () => {
			operation.destroy();
			settle({ ok: false, error: "timeout" });
		});
		operation.once("error", error => {
			settle({ ok: false, error: error.code || error.message });
		});
		operation.end();
	});
}

/** Verifies the HTTP status and stops as soon as 512 bytes are inspected. */
function collect(response, settle) {
	const statusCode = Number(response.statusCode || 0);
	let sample = Buffer.alloc(0);
	const finish = () => {
		const ok = statusCode >= 200 && statusCode < 400;
		settle({
			ok,
			status: statusCode,
			statusCode,
			headers: response.headers,
			title: title(sample.toString("utf8")),
			...(ok ? {} : { error: `http_${statusCode}` })
		});
	};
	response.on("data", chunk => {
		const remaining = SAMPLE_BYTES - sample.length;
		if (remaining > 0) {
			sample = Buffer.concat([sample, chunk.subarray(0, remaining)]);
		}
		if (sample.length === SAMPLE_BYTES) {
			finish();
			response.destroy();
		}
	});
	response.once("end", finish);
	response.once("error", error => {
		settle({ ok: false, error: error.code || error.message });
	});
}

/** Extracts a short HTML title without interpreting untrusted markup. */
function title(html) {
	const match = String(html || "").match(/<title[^>]*>([^<]{1,120})<\/title>/i);
	return match ? match[1].trim() : "";
}

/** Bounds latency without allowing an infinite HTTP probe. */
function boundedTimeout(value) {
	return Math.max(100, Math.min(Number(value || 700), 15000));
}

module.exports = { request, title };
