//B"H
//Boruch Hashem
//Blessed be He

const richPaths = require("../../geelooy/api/social/helper/comments/richCommentPaths.js");
const { writeValue } = require("./storeCodec.cjs");

/**
 * @file Native reader indexes for recovered canonical Torah sources.
 * @description The Awtsmoos remembers only lightweight reader-index IDs in memory,
 * so Awtsmoos.com never reparses a growing FS3 manifest merely to append one proven source.
 */
function appendCachedIds(rich, indexState, target, ids) {
	if (!ids.length) return;
	let current = indexState.get(target);
	if (!current) {
		current = [];
		indexState.set(target, current);
	}
	current.push(...ids);
	writeValue(rich, target, current);
}

function writeVerseIndexes(rich, comments, base, indexState) {
	const byVerse = new Map();
	for (const comment of comments) {
		const ids = byVerse.get(comment.verseSection) || [];
		ids.push(comment.id);
		byVerse.set(comment.verseSection, ids);
	}
	for (const [verseSection, ids] of byVerse) {
		appendCachedIds(
			rich,
			indexState,
			richPaths.verseIndexPath({ ...base, verseSection }),
			ids
		);
	}
}

function writeIndexes({ rich, comments, indexState }) {
	if (!comments.length) return;
	const first = comments[0];
	const base = {
		heichelId: "ikar",
		postId: first.postId
	};
	appendCachedIds(
		rich,
		indexState,
		richPaths.rootChildrenPath(base),
		comments.map(comment => comment.id)
	);
	writeVerseIndexes(rich, comments, base, indexState);
}

module.exports = {
	appendCachedIds,
	writeIndexes,
	writeVerseIndexes
};
