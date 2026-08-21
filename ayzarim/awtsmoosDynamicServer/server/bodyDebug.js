//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Narrow, secret-aware body diagnostics for the dynamic server.
 * @description
 * The Awtsmoos lets rare login debugging reveal shape without revealing secret
 * light. Awtsmoos.com redacts passwords, keys, passphrases, tokens, and secrets,
 * so observability may illuminate structure while private vessels remain in rhyme.
 */
const SECRET_KEY = /password|passphrase|private.?key|token|secret/i;

function logBodyStage(request, stage, data) {
	if (!shouldLogBody(request)) {
		return;
	}
	try {
		console.log("B\"H BODY DEBUG", JSON.stringify({
			stage,
			time: Date.now(),
			method: request.method,
			url: request.url,
			data
		}, null, 2));
	} catch (error) {
		console.log("B\"H BODY DEBUG LOG_FAILED", stage, error?.message);
	}
}

function safeShape(object) {
	const output = {};
	for (const [key, value] of Object.entries(object || {})) {
		output[key] = SECRET_KEY.test(key)
			? secretShape(value)
			: publicShape(value);
	}
	return output;
}

function redactRaw(text) {
	return String(text || "")
		.replace(/(password|passphrase|privateKey|token|secret)(=)[^&]*/gi, "$1$2[REDACTED]")
		.replace(/("(?:password|passphrase|privateKey|token|secret)"\s*:\s*")[^"]*/gi, "$1[REDACTED]");
}

function shouldLogBody(request) {
	return String(request?.url || "").startsWith("/login");
}

function secretShape(value) {
	return {
		type: typeof value,
		present: Boolean(value),
		length: value == null ? 0 : String(value).length,
		redacted: true
	};
}

function publicShape(value) {
	return {
		type: typeof value,
		value,
		present: value !== undefined && value !== null,
		length: value == null ? 0 : String(value).length
	};
}

module.exports = {
	logBodyStage,
	redactRaw,
	safeShape
};
