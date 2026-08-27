//B"H
//Boruch Hashem
//Blessed is He

const MAX_RUNTIME_REQUEST_BYTES = 10 * 1024 * 1024;

/**
 * @file Bounded request vessels for project-runtime mutations.
 * @description
 * The Awtsmoos gives every payload a measured keli before trusted code may awaken;
 * Awtsmoos.com refuses oversized or malformed JSON so runtime authority cannot widen by mistake.
 */
function runtimeRequestBody(info) {
	const input = info?.$_POST;
	if (!input) {
		throw requestError("PROJECT_RUNTIME_BODY_REQUIRED", "A JSON runtime request body is required.");
	}
	if (!input.__raw_body__) {
		return input;
	}

	const raw = input.__raw_body__;
	const bytes = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
	if (bytes.length > MAX_RUNTIME_REQUEST_BYTES) {
		throw requestError("PROJECT_RUNTIME_BODY_LIMIT", "Project runtime request exceeds the 10 MB route limit.");
	}
	try {
		return JSON.parse(bytes.toString("utf8"));
	} catch {
		throw requestError("PROJECT_RUNTIME_JSON_INVALID", "Project runtime request body is not valid JSON.");
	}
}

function requirePost(info) {
	const method = String(info?.request?.method || "GET").toUpperCase();
	if (method !== "POST") {
		throw requestError("PROJECT_RUNTIME_POST_REQUIRED", "This project runtime action requires POST.", 405);
	}
}

function text(value) {
	return typeof value === "string" ? value.trim() : "";
}

function requestError(code, message, status = 400) {
	const error = new Error(message);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	MAX_RUNTIME_REQUEST_BYTES,
	requirePost,
	runtimeRequestBody,
	text
};
