//B"H
//Boruch Hashem
//Blessed be He

const richPaths = require("../../geelooy/api/social/helper/comments/richCommentPaths.js");
const {
	pointer,
	postPath
} = require("../../geelooy/api/social/helper/comments/aliasIndex/IndexCodec.js");
const {
	appendIds,
	readValue,
	writeValue
} = require("./storeCodec.cjs");

/**
 * @file Index writer for recovered source commentary.
 * @description Keeps root, verse, and commentator-pointer indexes synchronized with accepted candidate bodies.
 */
function writeVerseIndexes(rich, comments, base) {
	const byVerse = new Map();
	for (const comment of comments) {
		const ids = byVerse.get(comment.verseSection) || [];
		ids.push(comment.id);
		byVerse.set(comment.verseSection, ids);
	}
	for (const [verseSection, ids] of byVerse) {
		appendIds(
			rich,
			richPaths.verseIndexPath({ ...base, verseSection }),
			ids
		);
	}
}

function writeAliasIndex(alias, comments, first) {
	const target = postPath(
		first.aliasId,
		"ikar",
		first.seriesId,
		first.postId
	);
	const value = readValue(alias, target, []);
	const current = Array.isArray(value) ? value : [];
	const fresh = comments.map(pointer);
	const ids = new Set(fresh.map(item => item.commentId));
	writeValue(
		alias,
		target,
		[...fresh, ...current.filter(item => !ids.has(item.commentId))]
	);
}
function writeIndexes({ rich, alias, comments }) {
	if (!comments.length) return;
	const first = comments[0];
	const base = {
		heichelId: "ikar",
		postId: first.postId
	};
	appendIds(
		rich,
		richPaths.rootChildrenPath(base),
		comments.map(comment => comment.id)
	);
	writeVerseIndexes(rich, comments, base);
	writeAliasIndex(alias, comments, first);
}

module.exports = {
	writeIndexes
};
