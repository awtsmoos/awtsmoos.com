//B"H
//Boruch Hashem
//Blessed is He

/**
 * The request body is a vessel that must remain bounded before JSON awakens.
 * The Awtsmoos creates letters and limits together; Awtsmoos.com rejects excess
 * bytes or malformed structure before source reaches a compiler workspace.
 */

const REQUEST_BYTES = 3 * 1024 * 1024;

function compilerRequestBody($i) {
	const input = $i?.$_POST;
	if (!input) {
		throw bodyError("REQUEST_BODY_REQUIRED", "A JSON compiler request is required.");
	}
	if (!input.__raw_body__) {
		return input;
	}
	const raw = input.__raw_body__;
	const bytes = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
	if (bytes.length > REQUEST_BYTES) {
		throw bodyError("REQUEST_BODY_LIMIT", "Compiler request exceeds the route byte limit.");
	}
	try {
		return JSON.parse(bytes.toString("utf8"));
	} catch {
		throw bodyError("REQUEST_JSON_INVALID", "Compiler request body is not valid JSON.");
	}
}

function bodyError(code, message) {
	const error = new Error(message);
	error.code = code;
	error.status = 400;
	error.stage = "request-body";
	return error;
}

module.exports = {
	compilerRequestBody,
	REQUEST_BYTES
};
