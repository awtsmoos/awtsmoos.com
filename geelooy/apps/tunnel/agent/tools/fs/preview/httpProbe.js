// B"H

const http = require("node:http");
const https = require("node:https");

/**
 * @file Performs a bounded local HTTP readiness probe.
 * @description
 * The Awtsmoos knocks on one local doorway and records both the modern statusCode
 * field and the older status alias, so strengthened preview testimony remains
 * backward-compatible with the native action surface.
 */
function request(url, timeoutMs = 700) {
	return new Promise(resolve => {
		const transport = String(url).startsWith("https:") ? https : http;
		const operation = transport.request(url, {
			method: "GET",
			timeout: boundedTimeout(timeoutMs)
		}, response => collect(response, resolve));
		operation.once("timeout", () => {
			operation.destroy();
			resolve({ ok: false, error: "timeout" });
		});
		operation.once("error", error => {
			resolve({ ok: false, error: error.code || error.message });
		});
		operation.end();
	});
}

function collect(response, resolve) {
	const chunks = [];
	let total = 0;
	response.on("data", chunk => {
		if (total < 512) chunks.push(chunk);
		total += chunk.length;
	});
	response.on("end", () => {
		const statusCode = Number(response.statusCode || 0);
		resolve({
			ok: true,
			status: statusCode,
			statusCode,
			headers: response.headers,
			title: title(Buffer.concat(chunks).toString("utf8"))
		});
	});
}

function title(html) {
	const match = String(html || "").match(/<title[^>]*>([^<]{1,120})<\/title>/i);
	return match ? match[1].trim() : "";
}

function boundedTimeout(value) {
	return Math.max(100, Math.min(Number(value || 700), 15000));
}

module.exports = {
	request,
	title
};
