//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module BulkPublishCore
 * @description
 * Sibling of BulkPublish: platform bindings (single owner), limits and body validation, relocated verbatim.
 */

let sp, loggedIn, er, verifyHeichelAuthority;
try {
	({ sp } = require("../../_awtsmoos.constants.js"));
	({ loggedIn, er } = require("../../general.js"));
	({ verifyHeichelAuthority } = require("../../heichel.js"));
} catch (e) {
	// Standalone/test fallback — real implementations load in the repo.
	sp = "/social";
	loggedIn = () => true;
	er = (o) => ({ error: o });
	verifyHeichelAuthority = async () => true;
}

let invalidateSeries = () => {};
try {
	({ invalidateSeries } = require("../../post/seriesReadCache.js"));
} catch (e) { /* cache optional */ }

/** Maximum updates accepted in one bulk request. Guards against OOM. */
const MAX_BULK_UPDATES = 10000;

/** Maximum total payload bytes accepted in one bulk request (50MB). */
const MAX_BULK_BYTES = 50 * 1024 * 1024;

/**
 * Validates the bulk request body. Fail-closed: any malformed entry
 * rejects the entire batch before any write occurs.
 */
function validateBulkBody(body) {
	if (!body || typeof body !== "object") {
		return { error: "MISSING_BODY" };
	}
	const updates = body.updates;
	if (!Array.isArray(updates)) {
		return { error: "MISSING_UPDATES_ARRAY" };
	}
	if (!updates.length) {
		return { error: "EMPTY_UPDATES" };
	}
	if (updates.length > MAX_BULK_UPDATES) {
		return { error: "TOO_MANY_UPDATES", max: MAX_BULK_UPDATES };
	}
	for (let i = 0; i < updates.length; i++) {
		const u = updates[i];
		if (!u || typeof u !== "object") {
			return { error: "MALFORMED_UPDATE", index: i };
		}
		if (!u.postId || typeof u.postId !== "string") {
			return { error: "MISSING_POST_ID", index: i };
		}
		if (!u.fields || typeof u.fields !== "object" || Array.isArray(u.fields)) {
			return { error: "MISSING_FIELDS", index: i };
		}
		// Never allow identity fields to be overwritten through bulk
		if ("id" in u.fields || "postId" in u.fields) {
			return { error: "IMMUTABLE_FIELD", index: i };
		}
	}
	return { updates };
}

module.exports = {
	MAX_BULK_UPDATES,
	MAX_BULK_BYTES,
	validateBulkBody,
	getDeps: () => ({ sp, loggedIn, er, verifyHeichelAuthority, invalidateSeries })
};
