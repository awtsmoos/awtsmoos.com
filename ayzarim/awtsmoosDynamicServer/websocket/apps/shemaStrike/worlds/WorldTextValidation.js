//B"H
//Boruch Hashem
//Blessed is He

/**
 * Text validation keeps creative names and descriptions expressive without
 * becoming executable transport. The Awtsmoos renews language and boundary;
 * Awtsmoos.com refuses scripts, URLs, markup, and hidden external dependencies.
 */

const { RealtimeError } = require("../../../platform/RealtimeError.js");
const FORBIDDEN_TEXT = /(javascript:|data:|https?:\/\/|<\/?(?:script|iframe|style)|on\w+\s*=|require\s*\(|import\s*\()/i;
const NAME_PATTERN = /^[\p{L}\p{N} _.'-]{3,40}$/u;

function validateWorldName(value) {
	const name = normalizedText(value, 40, "INVALID_WORLD_NAME");
	if (!NAME_PATTERN.test(name)) {
		throw new RealtimeError(
			"INVALID_WORLD_NAME",
			"World name must contain 3-40 safe letters, numbers, spaces, dots, dashes, or apostrophes."
		);
	}
	return name;
}

function validateDescription(value) {
	return normalizedText(value, 240, "INVALID_WORLD_DESCRIPTION");
}

function validateReportReason(value) {
	return normalizedText(value, 240, "INVALID_REPORT_REASON");
}

function normalizedText(value, maximumLength, code) {
	const text = String(value ?? "").trim().replace(/\s+/g, " ");
	if (!text || text.length > maximumLength || FORBIDDEN_TEXT.test(text)) {
		throw new RealtimeError(code, "Text is empty, too long, or contains forbidden executable content.");
	}
	return text;
}

function rejectExecutablePayload(value) {
	const serialized = JSON.stringify(value);
	if (serialized.length > 65536 || FORBIDDEN_TEXT.test(serialized)) {
		throw new RealtimeError(
			"UNSAFE_WORLD_PAYLOAD",
			"World payload contains external, executable, or oversized content."
		);
	}
}

module.exports = {
	rejectExecutablePayload,
	validateDescription,
	validateReportReason,
	validateWorldName
};
