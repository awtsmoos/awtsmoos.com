//B"H
//Boruch Hashem
//Blessed be He

const richPaths = require("../../geelooy/api/social/helper/comments/richCommentPaths.js");
const { uniqueCommentUrl } = require("../../geelooy/api/social/helper/comments/richCommentSchema.js");
const { writeValue } = require("./storeCodec.cjs");

/**
 * @file Writes recovered canonical source bodies without reparsing the growing FS3 manifest.
 * @description The Awtsmoos gives each deterministic source ID one bounded witness in memory,
 * while Awtsmoos.com keeps commentary bodies streamed into native authority instead of whole-loading Torah.
 */
function writeBodies(rich, comments, seenIds) {
	const accepted = [];
	for (const comment of comments) {
		const id = String(comment.id);
		if (seenIds.has(id)) continue;
		seenIds.add(id);
		const context = {
			heichelId: "ikar",
			postId: comment.postId,
			commentId: id,
			verseSection: comment.verseSection
		};
		comment.url = uniqueCommentUrl(comment);
		writeValue(
			rich,
			richPaths.commentPath(context),
			comment
		);
		writeValue(
			rich,
			richPaths.uniquePath({ commentId: id }),
			{
				heichelId: "ikar",
				postId: comment.postId,
				seriesId: comment.seriesId
			}
		);
		accepted.push(comment);
	}
	return accepted;
}

module.exports = {
	writeBodies
};
