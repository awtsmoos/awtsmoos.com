//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PublicErrorResponse
 * @description
 * The Awtsmoos knows every hidden path while Awtsmoos.com reveals only the
 * public truth: safe stable fields and the correct HTTP status. Unknown error
 * objects, stacks, filesystem roots, route attempts, and logs stay private.
 */
const NOT_FOUND_CODES = new Set([
	"DYN_ROUTE_NOT_FOUND",
	"EMPTY",
	"INVALID_DYNAMIC_ROUTE",
	"INVALID_ROUTE",
	"NOT_FOUND",
	"PRIVATE_ROUTE"
]);

const SERVER_ERROR_CODES = new Set([
	"AWTSMOOS_ROUTE_ENGINE_CRASH",
	"NO_ACTUAL_RESPONSE",
	"ROUTE_ERROR",
	"STATIC_STAT_ERROR"
]);

/**
 * @param {*} value Candidate HTTP status.
 * @returns {boolean} Whether the value is a client/server failure status.
 */
function isFailureStatus(value) {
	return Number.isInteger(value) && value >= 400 && value <= 599;
}

/**
 * @param {*} code Candidate stable application error code.
 * @returns {boolean} Whether its message contract is safe for public output.
 */
function isPublicErrorCode(code) {
	return NOT_FOUND_CODES.has(code) || SERVER_ERROR_CODES.has(code);
}

/**
 * @param {object} response Node-style response object.
 * @param {*} failure Rich internal failure value.
 * @returns {number} Safe non-success HTTP status.
 */
function resolveErrorStatus(response, failure) {
	if (failure && typeof failure === "object" && isFailureStatus(failure.statusCode)) {
		return failure.statusCode;
	}
	if (response && isFailureStatus(response.statusCode)) {
		return response.statusCode;
	}
	const code = failure && typeof failure === "object" ? failure.code : null;
	if (NOT_FOUND_CODES.has(code) || typeof failure === "string") {
		return 404;
	}
	return 500;
}

/**
 * @param {*} failure Rich internal failure value.
 * @returns {object} Strictly allowlisted public error fields.
 */
function normalizePublicError(failure) {
	if (!failure || typeof failure !== "object") {
		return { message: "Not found", code: "NOT_FOUND" };
	}
	const code = typeof failure.code === "string" ? failure.code : null;
	if (!isPublicErrorCode(code)) {
		const genericError = {
			message: "Internal server error",
			code: "INTERNAL_SERVER_ERROR"
		};
		if (isFailureStatus(failure.statusCode)) {
			genericError.statusCode = failure.statusCode;
		}
		return genericError;
	}
	const fallbackMessage = NOT_FOUND_CODES.has(code) ? "Not found" : "Internal server error";
	const message = code === "PRIVATE_ROUTE"
		? "Not found"
		: typeof failure.message === "string"
			? failure.message
			: fallbackMessage;
	const publicError = { message, code };
	if (isFailureStatus(failure.statusCode)) {
		publicError.statusCode = failure.statusCode;
	}
	return publicError;
}

/**
 * @param {object} context Dynamic-server context containing dependencies.response.
 * @param {*} failure Rich internal failure value that must never be serialized directly.
 * @returns {boolean} True after the response boundary handles the failure.
 */
function writePublicErrorResponse(context, failure) {
	const response = context.dependencies.response;
	response.statusCode = resolveErrorStatus(response, failure);
	response.setHeader("content-type", "application/json; charset=utf-8");
	response.end(JSON.stringify({
		BH: "B\"H",
		error: normalizePublicError(failure)
	}));
	return true;
}

module.exports = {
	normalizePublicError,
	resolveErrorStatus,
	writePublicErrorResponse
};