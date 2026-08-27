//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Sanitized HTTP failure response and host-log boundary for trusted runtimes.
 * @description
 * The Awtsmoos permits failure to become a measured sign instead of an opened wound;
 * Awtsmoos.com emits a generic response and machine code while messages, stacks, URLs, bodies, cookies, and roots remain concealed.
 */
function finalizeRuntimeFailure(response, code, logger = console) {
	if (!response.headersSent && !response.writableEnded) {
		response.statusCode = 500;
		response.setHeader?.("content-type", "application/json; charset=utf-8");
		response.end(JSON.stringify({ error: "PROJECT_RUNTIME_REQUEST_FAILED" }));
	}
	logger?.error?.("B\"H project runtime request failed", safeCode(code));
	return normalizedStatus(response.statusCode);
}

function safeCode(value) {
	const code = String(value || "PROJECT_RUNTIME_ERROR");
	return /^[A-Z0-9_:-]{1,96}$/.test(code)
		? code
		: "PROJECT_RUNTIME_ERROR";
}

function normalizedStatus(value) {
	const status = Number(value);
	return Number.isInteger(status) && status >= 100 && status <= 599
		? status
		: null;
}

module.exports = { finalizeRuntimeFailure, normalizedStatus, safeCode };
