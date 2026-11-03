// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RichCommentCount
 * @description
 * Post-level comment counts maintained by the rich create/delete paths.
 * Feed cards and profile surfaces read a post's `commentCount`, but nothing
 * in the native comment pipeline used to maintain one, so counts drifted
 * from the thread (the Part 2C count contradictions). The counter now lives
 * in a small per-post meta record inside the packed comment store, is
 * recounted from the indexes the first time it is needed, and is written
 * through to the post's own record (best effort) for card consumers.
 * Maintenance is failure-isolated: a count problem must never fail a
 * comment create or delete.
 */
const access = require('./richCommentAccess.js');
const paths = require('./richCommentPaths.js');
const { sp } = require('../_awtsmoos.constants.js');

/** Returns the maintained counter, or null when none was ever recorded. */
function storedCount({ $i, heichelId, postId }) {
	const meta = access.read($i, paths.postMetaPath(access.context(heichelId, postId)), null);
	const value = Number(meta?.commentCount);
	return Number.isFinite(value) && value >= 0 ? value : null;
}

function countSubtree({ $i, heichelId, postId, commentId }) {
	const got = access.getComment({ $i, heichelId, postId, commentId });
	if (!got.success || got.success.deleted) return 0;
	let total = 1;
	const children = access.array(
		access.read($i, paths.childIndexPath(access.context(heichelId, postId, { commentId })), [])
	);
	for (const childId of children) {
		total += countSubtree({ $i, heichelId, postId, commentId: childId });
	}
	return total;
}

/** Counts every live (non-deleted) comment on the post from the indexes. */
function recountPostComments({ $i, heichelId, postId }) {
	const roots = access.array(
		access.read($i, paths.rootChildrenPath(access.context(heichelId, postId)), [])
	);
	let total = 0;
	for (const id of roots) {
		total += countSubtree({ $i, heichelId, postId, commentId: id });
	}
	return total;
}

async function syncPostRecord({ $i, heichelId, postId, commentCount }) {
	try {
		if (typeof $i?.db?.syncKeyInObj !== 'function') return;
		await $i.db.syncKeyInObj(
			`${sp}/heichelos/${heichelId}/posts/${postId}`,
			'commentCount',
			commentCount
		);
	} catch (error) {
		console.error(
			`B"H [richCommentCount] post record sync failed for ${heichelId}/${postId}:`,
			error?.message || error
		);
	}
}

/**
 * Applies a delta to the post's maintained comment counter, recounting
 * from the indexes when no counter exists yet. Never throws.
 * @returns {Promise<number|null>} The new count, or null on failure.
 */
async function adjustPostCommentCount({ $i, heichelId, postId, delta }) {
	try {
		if (!delta) return storedCount({ $i, heichelId, postId });
		const current = storedCount({ $i, heichelId, postId });
		// The hooks run AFTER the mutation's writes land, so a first-time
		// recount already reflects this create/delete — it IS the new
		// total. Only an existing counter takes the delta on top.
		const next = current === null
			? recountPostComments({ $i, heichelId, postId })
			: Math.max(0, current + delta);
		access.write(
			$i,
			paths.postMetaPath(access.context(heichelId, postId)),
			{ commentCount: next, updatedAt: Date.now() }
		);
		await syncPostRecord({ $i, heichelId, postId, commentCount: next });
		return next;
	} catch (error) {
		console.error(
			`B"H [richCommentCount] adjust failed for ${heichelId}/${postId}:`,
			error?.message || error
		);
		return null;
	}
}

module.exports = {
	adjustPostCommentCount,
	recountPostComments,
	storedCount
};
