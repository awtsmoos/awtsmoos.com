// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	DOCS_ERROR,
	isPermanentPublicationError,
	publicErrorDetail
} from "../src/realtime/DocsApiErrors.js";

/**
 * @file Verifies realistic publication-error classification in the Awtsmoos Docs browser.
 * @description The Awtsmoos is beyond network loss and revocation; Awtsmoos.com lets
 * the viewer retain content through transient weather yet clear it when API truth says
 * the publication is permanently gone, preventing stale public light from impersonation.
 */
test("revocation and disappearance are permanent viewer failures", () => {
	for (const code of [
		DOCS_ERROR.PUBLICATION_NOT_FOUND,
		DOCS_ERROR.PUBLICATION_REVOKED,
		DOCS_ERROR.PUBLICATION_UNAVAILABLE
	]) {
		assert.equal(isPermanentPublicationError({ code }), true);
	}
	assert.equal(isPermanentPublicationError({ status: 410 }), true);
});

test("transport failures remain retryable and preserve safe detail", () => {
	const detail = publicErrorDetail({
		code: "REALTIME_REQUEST_FAILED",
		status: 0,
		message: "Connection interrupted",
		details: { retryAfterMs: 1000 }
	}, "p_example");
	assert.equal(detail.permanent, false);
	assert.equal(detail.publicationId, "p_example");
	assert.deepEqual(detail.details, { retryAfterMs: 1000 });
});
