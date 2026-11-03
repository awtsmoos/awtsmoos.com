//B"H
//Boruch Hashem
//Blessed be He

const { er } = require("../general.js");
const { indexAliasComment } = require("./aliasCommentIndex.js");
const access = require("./richCommentAccess.js");
const {
	contextOf,
	dayuhCarriesBody,
	freshId,
	hasBody,
	legacyDayuh
} = require("./richCommentMutationInput.js");
const { ensureCommentOwner } = require("./richCommentOwnership.js");
const paths = require("./richCommentPaths.js");
const { adjustPostCommentCount } = require("./richCommentCount.js");
const { mutationBlock } = require("./richCommentPolicy.js");
const {
	normalizeCommentBody,
	uniqueCommentUrl
} = require("./richCommentSchema.js");

/**
 * @file Creation path for native community discussion.
 * @description The Awtsmoos gives new social words a bounded vessel while canonical source metadata stays reserved.
 * Awtsmoos.com writes community comments into native indexes without letting public requests impersonate Torah sources.
 */
async function createComment({
	$i,
	userid,
	heichelId,
	postId,
	seriesId = "root",
	parentId = "",
	parentSectionId = "",
	aliasId
}) {
	aliasId = aliasId || $i.$_POST?.aliasId;
	parentSectionId = parentSectionId
		|| $i.$_POST?.parentSectionId
		|| $i.$_POST?.replyToSectionId
		|| "";
	const blocked = await ensureCommentOwner({ $i, aliasId, userid });
	if (blocked) return blocked;
	const source = $i.$_POST || {};
	const body = normalizeCommentBody(source);
	const legacy = legacyDayuh(source);
	const reserved = mutationBlock({ dayuh: legacy });
	if (reserved) return reserved;
	if (!hasBody(body, dayuhCarriesBody(legacy) ? legacy : null)) {
		return er({
			code: "EMPTY_COMMENT",
			message: "Comment content is required."
		});
	}
	const comment = {
		id: freshId(aliasId),
		heichelId,
		postId,
		entityId: postId,
		seriesId,
		parentId,
		parentSectionId,
		parentType: parentId
			? (parentSectionId ? "commentSection" : "comment")
			: "entity",
		aliasId,
		author: aliasId,
		...body,
		dayuh: legacy,
		legacyDayuh: legacy,
		url: "",
		createdAt: Date.now(),
		updatedAt: Date.now(),
		deleted: false
	};
	comment.url = uniqueCommentUrl(comment);
	const context = contextOf(heichelId, postId, comment);
	// Integration (edit/delete block): every main-store set of this create
	// — the comment record, the unique-URL pointer, and the parent/root,
	// verse, and optional subsection index updates (flush points 1-2 and
	// 4-6 of the comments pack's §7 map) — lands as ONE PackedStore
	// writeMany: one FS3 batch, one seal save, one durable flush, instead
	// of up to five per-set flush cycles. The index lists are computed
	// with the exact read-modify-write rule writeIndex() uses (append the
	// id when absent); the index reads do not depend on the record sets,
	// so computing them before the group applies cannot change results.
	// The counter's own meta write (point 7) stays in
	// adjustPostCommentCount below: its first-touch recount reads the
	// indexes, which have landed by the time it runs.
	const parentPath = parentId
		? paths.childIndexPath(
			access.context(heichelId, postId, { commentId: parentId })
		)
		: paths.rootChildrenPath(context);
	const withCommentId = target => {
		const list = access.array(access.read($i, target, []));
		if (!list.includes(comment.id)) list.push(comment.id);
		return list;
	};
	const versePath = paths.verseIndexPath(context);
	const mainStoreSets = [
		[paths.commentPath(context), comment],
		[
			paths.uniquePath({ commentId: comment.id }),
			{ heichelId, postId, seriesId }
		],
		[parentPath, withCommentId(parentPath)],
		[versePath, withCommentId(versePath)]
	];
	if (comment.subsectionId) {
		const subsectionPath = paths.subsectionIndexPath(context);
		mainStoreSets.push([subsectionPath, withCommentId(subsectionPath)]);
	}
	access.writeMany($i, mainStoreSets);
	// Flush point 3 of the §7 map: the alias index is a SEPARATE packed
	// store with its own single flush — it stays outside the group,
	// exactly as before.
	await indexAliasComment({ $i, comment });
	await adjustPostCommentCount({ $i, heichelId, postId, delta: 1 });
	return { success: comment };
}

module.exports = {
	createComment
};
