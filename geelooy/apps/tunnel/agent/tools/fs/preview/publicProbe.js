// B"H

const crypto = require("node:crypto");
const http = require("node:http");
const https = require("node:https");

/**
 * @file Verifies the actual public Awtsmoos preview route.
 * @description
 * The Awtsmoos distinguishes a URL that was imagined from one that carried bytes.
 * Verification requires a real public response and, when supplied, an expected body
 * hash or marker. Authentication material is accepted only as an explicit header map.
 */
function verify(url, options = {}) {
	return new Promise(resolve => {
		let parsed;
		try {
			parsed = new URL(url);
		} catch (error) {
			return resolve(failure("invalid_public_preview_url", error.message));
		}
		const transport = parsed.protocol === "https:" ? https : http;
		const startedAt = Date.now();
		const request = transport.request(parsed, {
			method: "GET",
			headers: safeHeaders(options.headers)
		}, response => collect(response, options, startedAt, resolve));
		request.setTimeout(limit(options.timeoutMs, 1000, 15000, 5000), () => {
			request.destroy(new Error("public_preview_timeout"));
		});
		request.once("error", error => resolve(failure(error.message, "", startedAt)));
		request.end();
	});
}

function collect(response, options, startedAt, resolve) {
	const chunks = [];
	let total = 0;
	response.on("data", chunk => {
		total += chunk.length;
		if (total <= limit(options.maxBytes, 1024, 1048576, 131072)) chunks.push(chunk);
	});
	response.on("end", () => {
		const body = Buffer.concat(chunks);
		const digest = crypto.createHash("sha256").update(body).digest("hex");
		const marker = String(options.expectedMarker || "");
		const hash = String(options.expectedSha256 || "");
		const statusOk = Number(response.statusCode || 0) >= 200 && Number(response.statusCode || 0) < 400;
		const proofOk = (!marker || body.includes(Buffer.from(marker))) && (!hash || digest === hash);
		resolve({
			ok: statusOk && proofOk,
			verified: statusOk && proofOk,
			statusCode: response.statusCode,
			sha256: digest,
			bytes: total,
			waitedMs: Date.now() - startedAt,
			error: statusOk && proofOk ? "" : "public_preview_proof_mismatch"
		});
	});
}

function safeHeaders(headers = {}) {
	return Object.fromEntries(Object.entries(headers || {}).filter(([name]) =>
		!["host", "connection", "content-length"].includes(String(name).toLowerCase())
	));
}

function failure(error, message = "", startedAt = Date.now()) {
	return {
		ok: false,
		verified: false,
		error: String(error || "public_preview_failed"),
		message,
		waitedMs: Date.now() - startedAt
	};
}

function limit(value, minimum, maximum, fallback) {
	return Math.max(minimum, Math.min(Number(value || fallback), maximum));
}

module.exports = {
	verify
};
