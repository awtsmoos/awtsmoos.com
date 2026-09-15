//B"H
//Boruch Hashem
//Blessed be He

const { er } = require("../general.js");
const { indexAliasComment } = require("./aliasCommentIndex.js");
const access = require("./richCommentAccess.js");
const {
	contextOf,
	freshId,
	hasBody,
	legacyDayuh
} = require("./richCommentMutationInput.js");
const { ensureCommentOwner } = require("./richCommentOwnership.js");
const paths = require("./richCommentPaths.js");
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
	if (!hasBody(body, legacy)) {
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
	access.write($i, paths.commentPath(context), comment);
	access.write(
		$i,
		paths.uniquePath({ commentId: comment.id }),
		{ heichelId, postId, seriesId }
	);
	await indexAliasComment({ $i, comment });
	const parentPath = parentId
		? paths.childIndexPath(
			access.context(heichelId, postId, { commentId: parentId })
		)
		: paths.rootChildrenPath(context);
	access.writeIndex($i, parentPath, comment.id);
	access.writeIndex($i, paths.verseIndexPath(context), comment.id);
	if (comment.subsectionId) {
		access.writeIndex($i, paths.subsectionIndexPath(context), comment.id);
	}
	return { success: comment };
}

module.exports = {
	createComment
};
