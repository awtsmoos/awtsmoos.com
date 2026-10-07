// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BulkPublish
 * @description
 * Lightning-fast bulk publish endpoint for series posts. Accepts an array of
 * post updates in a single request and applies them all inside one DB batch
 * boundary, using coalesced concurrent writes. One durability flush for the
 * entire batch instead of one per post.
 *
 * Route: POST /heichelos/:heichel/series/:series/posts/bulk
 * Body: { updates: [{ postId, fields: {...} }], options?: { createIfMissing } }
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

/**
 * Applies bulk post updates inside a single DB batch.
 *
 * Uses db.concurrent.writePath when available (coalesces sibling writes
 * sharing a parent path into one durable generation), falling back to
 * db.updateEntry per post. The entire batch runs inside db.batch() so
 * only one waitForIdle/durability boundary fires at the end.
 *
 * @param {object} args
 * @param {object} args.$i Request context with db handle.
 * @param {string} args.heichelId Heichel identity.
 * @param {string} args.seriesId Series identity.
 * @param {Array} args.updates Validated update entries.
 * @param {boolean} args.createIfMissing Create post shells for unknown IDs.
 * @returns {Promise<object>} Per-post results.
 */
async function bulkPublishPosts({ $i, heichelId, seriesId, updates, createIfMissing = false }) {
	const seriesPostsPath = `${sp}/heichelos/${heichelId}/series/${seriesId}/posts`;
	const results = [];
	const failures = [];

	const db = $i.db;
	const useConcurrent = db && db.concurrent && typeof db.concurrent.writePath === "function";
	const useBatch = db && typeof db.batch === "function";

	const applyAll = async () => {
		const pending = updates.map(async (u, index) => {
			const postPath = `${seriesPostsPath}/${u.postId}`;
			try {
				let existing = null;
				try {
					existing = await db.get(postPath, { max: true }).catch(() => null);
				} catch (e) { existing = null; }

				if (!existing || (typeof existing === "object" && existing.error)) {
					if (!createIfMissing) {
						failures.push({ postId: u.postId, index, error: "POST_NOT_FOUND" });
						return;
					}
					existing = { id: u.postId, postId: u.postId };
				}

				const merged = { ...existing, ...u.fields, updatedAt: Date.now() };

				if (useConcurrent) {
					await db.concurrent.writePath(postPath, merged);
				} else if (typeof db.updateEntry === "function") {
					await db.updateEntry(seriesPostsPath, { key: u.postId, value: merged });
				} else {
					await db.write(postPath, merged);
				}
				results.push({ postId: u.postId, index, success: true });
			} catch (e) {
				failures.push({ postId: u.postId, index, error: e.message || "WRITE_FAILED" });
			}
		});
		await Promise.all(pending);
	};

	if (useBatch) {
		await db.batch(applyAll);
	} else {
		await applyAll();
	}

	try { invalidateSeries(heichelId, seriesId); } catch (e) { /* ignore */ }

	return {
		success: {
			applied: results.length,
			failed: failures.length,
			total: updates.length,
			results,
			failures,
			batched: !!useBatch,
			coalesced: !!useConcurrent
		}
	};
}

/**
 * Route handler for POST /heichelos/:heichel/series/:series/posts/bulk
 */
async function bulkPublishRoute({ $i, heichelId, seriesId }) {
	if (!loggedIn($i)) return er({ message: "NO_LOGIN" });

	const aliasId = $i.$_POST?.aliasId;
	if (!aliasId) return er({ code: "MISSING_PARAMS", details: "Requires aliasId" });

	const isAuthorized = await verifyHeichelAuthority({ $i, aliasId, heichelId });
	if (!isAuthorized) return er({ code: "NO_AUTH" });

	// Payload size guard
	let bodySize = 0;
	try {
		bodySize = JSON.stringify($i.$_POST).length;
	} catch (e) { /* ignore */ }
	if (bodySize > MAX_BULK_BYTES) {
		return er({ code: "PAYLOAD_TOO_LARGE", max: MAX_BULK_BYTES });
	}

	const validation = validateBulkBody($i.$_POST);
	if (validation.error) {
		return er({ code: validation.error, details: validation });
	}

	const createIfMissing = $i.$_POST?.options?.createIfMissing === true;

	try {
		return await bulkPublishPosts({
			$i,
			heichelId,
			seriesId,
			updates: validation.updates,
			createIfMissing
		});
	} catch (e) {
		return er({ code: "BULK_PUBLISH_FAILED", details: e.message, stack: e.stack });
	}
}

module.exports = {
	MAX_BULK_UPDATES,
	MAX_BULK_BYTES,
	bulkPublishPosts,
	bulkPublishRoute,
	validateBulkBody
};
