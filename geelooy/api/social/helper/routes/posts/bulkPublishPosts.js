//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module BulkPublishPosts
 * @description
 * Sibling of BulkPublish: bulk post application inside one DB batch, relocated verbatim.
 */

const { getDeps } = require('./bulkPublishCore.js');
const { sp, invalidateSeries } = getDeps();

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

module.exports = { bulkPublishPosts };
