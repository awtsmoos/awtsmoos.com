//B"H
//Boruch Hashem
//Blessed be He

const path = require("path");
const { ANNOTATIONS } = require("./config.cjs");
const { RICH_FILE, ALIAS_FILE, packedFile } = require("./candidate.cjs");
const { PostIndex } = require("./postIndex.cjs");
const { openReadOnly, readValue } = require("./storeCodec.cjs");

/**
 * @file Independent commentary-candidate verifier.
 * @description Reopens candidate stores read-only and proves bodies, coordinates, and all essential indexes agree.
 */
function commentInodes(db) {
	return Object.values(db.__fs3Manifest?.inodes || {})
		.filter(inode => inode?.type === "file" && !inode.deleted)
		.filter(inode => /\/commentTree\/comments\/[^/]+\/data$/.test(inode.path || ""));
}

function commentIdFromPath(target) {
	return target.match(/\/comments\/([^/]+)\/data$/)?.[1] || "";
}

function includesId(value, id) {
	return Array.isArray(value) && value.map(String).includes(String(id));
}
function verifyOne({ rich, alias, posts, inode, failures }) {
	const comment = readValue(rich, inode.path, null);
	const id = commentIdFromPath(inode.path);
	if (!comment || comment.id !== id) return failures.push({ id, code: "BODY_ID_MISMATCH" });
	const policy = ANNOTATIONS[comment.aliasId];
	if (!policy) return failures.push({ id, code: "UNREVIEWED_ALIAS" });
	const sections = posts.sectionCount(comment.seriesId, comment.postId);
	const verse = Number(comment.verseSection);
	if (sections < 0) return failures.push({ id, code: "POST_MISSING" });
	if (!Number.isInteger(verse) || verse < 0 || verse >= sections) {
		return failures.push({ id, code: "COORDINATE_OUT_OF_RANGE" });
	}
	const unique = readValue(rich, `/social/commentUrls/${id}`, null);
	if (!unique || unique.postId !== comment.postId) failures.push({ id, code: "UNIQUE_POINTER_MISSING" });
	const verseIds = readValue(rich, `/social/heichelos/ikar/posts/${comment.postId}/commentTree/byVerse/${verse}`, []);
	if (!includesId(verseIds, id)) failures.push({ id, code: "VERSE_INDEX_MISSING" });
	const aliasPath = require("../../geelooy/api/social/helper/comments/aliasIndex/IndexCodec.js")
		.postPath(comment.aliasId, "ikar", comment.seriesId, comment.postId);
	const pointers = readValue(alias, aliasPath, []);
	if (!Array.isArray(pointers) || !pointers.some(item => item?.commentId === id)) {
		failures.push({ id, code: "ALIAS_POINTER_MISSING" });
	}
}
function verifyCandidate(root) {
	const rich = openReadOnly(packedFile(root, RICH_FILE));
	const alias = openReadOnly(packedFile(root, ALIAS_FILE));
	const posts = new PostIndex();
	const failures = [];
	let count = 0;
	try {
		for (const inode of commentInodes(rich)) {
			verifyOne({ rich, alias, posts, inode, failures });
			count++;
			if (failures.length >= 100) break;
		}
	} finally {
		for (const db of [rich, alias]) {
			try { db.close(); } catch {}
		}
		posts.close();
	}
	return {
		success: failures.length === 0 && count > 0,
		count,
		failures
	};
}

module.exports = {
	verifyCandidate
};
