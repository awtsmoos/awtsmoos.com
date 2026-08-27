// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");

/**
 * @file Names stable machine-readable failures for the Awtsmoos Docs realtime API.
 * @description The Awtsmoos is beyond success and failure; Awtsmoos.com gives every
 * finite refusal a measured code, safe message, status, and optional detail so clients
 * can react to reality without scraping changing English prose from an INTERNAL_ERROR.
 */
const DOCS_ERROR = Object.freeze({
	INVALID_INPUT: "DOCS_INVALID_INPUT",
	DOCUMENT_NOT_FOUND: "DOCS_DOCUMENT_NOT_FOUND",
	VIEW_DENIED: "DOCS_VIEW_DENIED",
	EDIT_DENIED: "DOCS_EDIT_DENIED",
	OWNER_REQUIRED: "DOCS_OWNER_REQUIRED",
	VERIFIED_ACCOUNT_REQUIRED: "DOCS_VERIFIED_ACCOUNT_REQUIRED",
	JOIN_REQUIRED: "DOCS_JOIN_REQUIRED",
	CONFLICT: "DOCS_CONFLICT",
	ACCESS_REVOKED: "DOCS_ACCESS_REVOKED",
	COMMENT_NOT_FOUND: "DOCS_COMMENT_NOT_FOUND",
	COMMENT_ANCHOR_NOT_FOUND: "DOCS_COMMENT_ANCHOR_NOT_FOUND",
	VERSION_NOT_FOUND: "DOCS_VERSION_NOT_FOUND",
	VERSION_LIMIT: "DOCS_VERSION_LIMIT",
	PUBLICATION_NOT_FOUND: "DOCS_PUBLICATION_NOT_FOUND",
	PUBLICATION_REVOKED: "DOCS_PUBLICATION_REVOKED",
	PUBLICATION_UNAVAILABLE: "DOCS_PUBLICATION_UNAVAILABLE",
	STORAGE_UNAVAILABLE: "DOCS_STORAGE_UNAVAILABLE"
});

/** Creates one explicit Docs realtime error from a stable code and safe public detail. */
function docsError(code, message, details = null, status = 400) {
	return new RealtimeError(code, message, details, status);
}

/** Creates a bounded validation failure whose machine detail identifies the field. */
function invalidInput(field, message = `${field} is invalid.`, details = {}) {
	return docsError(
		DOCS_ERROR.INVALID_INPUT,
		message,
		{ field, ...details },
		400
	);
}

/** Creates the canonical document-missing response without leaking storage state. */
function documentNotFound() {
	return docsError(
		DOCS_ERROR.DOCUMENT_NOT_FOUND,
		"Document not found.",
		null,
		404
	);
}

/** Creates a conflict response carrying enough revision detail for deliberate recovery. */
function documentConflict(details = {}) {
	return docsError(
		DOCS_ERROR.CONFLICT,
		"Document changed before this edit could be applied.",
		details,
		409
	);
}

/** Creates the permanent public-viewer response used after publication revocation. */
function publicationRevoked(publicationId = "") {
	return docsError(
		DOCS_ERROR.PUBLICATION_REVOKED,
		"This publication was revoked.",
		publicationId ? { publicationId } : null,
		410
	);
}

/** Creates a recoverable service failure when the backing document store cannot write. */
function storageUnavailable() {
	return docsError(
		DOCS_ERROR.STORAGE_UNAVAILABLE,
		"Document storage is temporarily unavailable.",
		null,
		503
	);
}

module.exports = {
	DOCS_ERROR,
	docsError,
	documentConflict,
	documentNotFound,
	invalidInput,
	publicationRevoked,
	storageUnavailable
};
