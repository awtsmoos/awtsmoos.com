//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module ProfileCommentBrowseFiles
 * @description
 * Sibling of ProfileCommentBrowse: comment-file readers and flattening, relocated verbatim.
 */

const { cleanText, idList } = require('./commentBrowseCache.js');

function countFileComments(file) {
	let n = 0;
	if (!file || typeof file !== "object") return 0;
	for (const vs of idList(file)) {
		const list = file[vs];
		if (Array.isArray(list)) n += list.length;
	}
	return n;
}

function firstPostTitle(file, postId) {
	if (!file || typeof file !== "object") return String(postId);
	for (const vs of idList(file)) {
		const list = file[vs];
		if (Array.isArray(list)) {
			for (const comment of list) {
				const title = cleanText(comment && comment.postTitle, 120);
				if (title) return title;
			}
		}
	}
	return String(postId);
}

function latestStamp(file) {
	let latest = 0;
	if (!file || typeof file !== "object") return 0;
	for (const vs of idList(file)) {
		const list = file[vs];
		if (Array.isArray(list)) {
			for (const comment of list) {
				const stamp = Number((comment && (comment.timestamp || comment.createdAt)) || 0);
				if (stamp > latest) latest = stamp;
			}
		}
	}
	return latest;
}

function flattenFileComments({ file, aliasId, heichelId, heichelName, seriesId, seriesTitle, postId, postTitle }) {
	const out = [];
	if (!file || typeof file !== "object") return out;
	for (const verseSection of idList(file)) {
		const list = file[verseSection];
		if (!Array.isArray(list)) continue;
		for (const comment of list) {
			out.push({
				id: (comment && (comment.id || comment.commentId)) || `${postId}-${verseSection}`,
				aliasId,
				heichelId,
				heichelName,
				seriesId,
				seriesTitle,
				postId,
				postTitle: cleanText((comment && comment.postTitle) || postTitle || postId, 120),
				postUrl: `/heichelos/${heichelId}/series/${seriesId}/post/${postId}`,
				verseSection: String(verseSection),
				segmentId: (comment && ((comment.dayuh && comment.dayuh.segmentId) || comment.segmentId)) || "",
				content: cleanText((comment && (comment.content || (comment.dayuh && comment.dayuh.content))) || "", 8000),
				createdAt: Number((comment && (comment.timestamp || comment.createdAt)) || 0),
				repliesCount: Array.isArray(comment && comment.replies) ? comment.replies.length : 0,
				likesCount: Number((comment && comment.likesCount) || 0)
			});
		}
	}
	return out;
}

module.exports = {
	countFileComments,
	firstPostTitle,
	latestStamp,
	flattenFileComments
};
