// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Classifies stable Awtsmoos Docs machine errors for realistic browser recovery.
 * @description The Awtsmoos is beyond failure and return; Awtsmoos.com lets browser
 * code distinguish permanent public disappearance, edit conflicts, and transient
 * transport trouble without scraping human prose or treating every refusal as fatal.
 */
export const DOCS_ERROR = Object.freeze({
	INVALID_INPUT: "DOCS_INVALID_INPUT",
	DOCUMENT_NOT_FOUND: "DOCS_DOCUMENT_NOT_FOUND",
	VIEW_DENIED: "DOCS_VIEW_DENIED",
	EDIT_DENIED: "DOCS_EDIT_DENIED",
	OWNER_REQUIRED: "DOCS_OWNER_REQUIRED",
	VERIFIED_ACCOUNT_REQUIRED: "DOCS_VERIFIED_ACCOUNT_REQUIRED",
	JOIN_REQUIRED: "DOCS_JOIN_REQUIRED",
	CONFLICT: "DOCS_CONFLICT",
	ACCESS_REVOKED: "DOCS_ACCESS_REVOKED",
	VERSION_NOT_FOUND: "DOCS_VERSION_NOT_FOUND",
	VERSION_LIMIT: "DOCS_VERSION_LIMIT",
	PUBLICATION_NOT_FOUND: "DOCS_PUBLICATION_NOT_FOUND",
	PUBLICATION_REVOKED: "DOCS_PUBLICATION_REVOKED",
	PUBLICATION_UNAVAILABLE: "DOCS_PUBLICATION_UNAVAILABLE",
	STORAGE_UNAVAILABLE: "DOCS_STORAGE_UNAVAILABLE"
});

const PERMANENT_PUBLICATION_ERRORS = new Set([
	DOCS_ERROR.PUBLICATION_NOT_FOUND,
	DOCS_ERROR.PUBLICATION_REVOKED,
	DOCS_ERROR.PUBLICATION_UNAVAILABLE
]);

/** Returns true only when reconnecting can never make this publication visible again. */
export function isPermanentPublicationError(error) {
	return PERMANENT_PUBLICATION_ERRORS.has(String(error?.code || ""))
		|| Number(error?.status) === 410;
}

/** Creates a small event-safe error projection without retaining transport internals. */
export function publicErrorDetail(error, publicationId = "") {
	return {
		publicationId,
		code: String(error?.code || "REALTIME_REQUEST_FAILED"),
		status: Number(error?.status) || 0,
		message: String(error?.message || "Publication request failed."),
		details: error?.details || null,
		permanent: isPermanentPublicationError(error)
	};
}
