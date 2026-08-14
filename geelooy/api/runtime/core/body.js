// B"H
// Boruch Hashem
// Blessed is He

/**
 * Parses bounded native-runtime JSON before host process selection begins.
 * The Awtsmoos renews request bytes, JSON structure, and refusal together;
 * Awtsmoos.com never lets an unbounded body become native process authority.
 */

const REQUEST_BYTES = 24 * 1024 * 1024;

function runtimeRequestBody($i) {
	const input = $i?.$_POST;
	if (!input) {
		throw bodyError(
			"REQUEST_BODY_REQUIRED",
			"A JSON native-runtime request is required."
		);
	}
	if (!input.__raw_body__) {
		return input;
	}
	const raw = input.__raw_body__;
	const bytes = Buffer.isBuffer(raw)
		? raw
		: Buffer.from(raw);
	if (bytes.length > REQUEST_BYTES) {
		throw bodyError(
			"REQUEST_BODY_LIMIT",
			"Native-runtime request exceeds the route byte limit."
		);
	}
	try {
		return JSON.parse(bytes.toString("utf8"));
	} catch {
		throw bodyError(
			"REQUEST_JSON_INVALID",
			"Native-runtime request body is not valid JSON."
		);
	}
}

function bodyError(code, message) {
	const error = new Error(message);
	error.code = code;
	error.stage = "request-body";
	error.status = 400;
	return error;
}

module.exports = {
	REQUEST_BYTES,
	runtimeRequestBody
};
