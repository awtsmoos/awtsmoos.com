//B"H
//Boruch Hashem
//Blessed be He

const { er } = require("../general.js");
const { indexAliasComment } = require("./aliasCommentIndex.js");
const access = require("./richCommentAccess.js");
const { legacyDayuh } = require("./richCommentMutationInput.js");
const { ensureCommentOwner } = require("./richCommentOwnership.js");
const paths = require("./richCommentPaths.js");
const { mutationBlock } = require("./richCommentPolicy.js");
const { normalizeCommentBody } = require("./richCommentSchema.js");

/**
 * @file Update path for native community discussion.
 * @description The Awtsmoos permits a living social word to be refined while canonical Torah remains untouched.
 * Awtsmoos.com verifies stored identity before any native comment body may change.
 */
async function updateComment({
	$i,
	userid,
	heichelId,
	postId,
	commentId,
	aliasId
}) {
	aliasId = aliasId || $i.$_PUT?.aliasId || $i.$_POST?.aliasId;
	const blocked = await ensureCommentOwner({ $i, aliasId, userid });
	if (blocked) return blocked;
	const got = access.getComment({
		$i,
		heichelId,
		postId,
		commentId
	});
	if (!got.success) return got;
	const immutable = mutationBlock(got.success);
	if (immutable) return immutable;
	if (String(got.success.aliasId || got.success.author) !== String(aliasId)) {
		return er({
			code: "NOT_AUTHORIZED",
			message: "Comment author mismatch."
		});
	}
	const source = $i.$_PUT || $i.$_POST || {};
	const normalized = normalizeCommentBody(source);
	const next = {
		...got.success,
		updatedAt: Date.now()
	};
	if ("content" in source || "text" in source) {
		next.content = normalized.content;
	}
	if ("assets" in source || "attachments" in source) {
		next.assets = normalized.assets;
	}
	if ("sections" in source || "commentSections" in source) {
		next.sections = normalized.sections;
	}
	if ("links" in source) {
		next.links = normalized.links;
		next.previews = normalized.previews;
	}
	const legacy = legacyDayuh(source);
	if (legacy) {
		next.dayuh = legacy;
		next.legacyDayuh = legacy;
	}
	access.write(
		$i,
		paths.commentPath(
			access.context(heichelId, postId, { commentId })
		),
		next
	);
	await indexAliasComment({ $i, comment: next });
	return { success: next };
}

module.exports = {
	updateComment
};
