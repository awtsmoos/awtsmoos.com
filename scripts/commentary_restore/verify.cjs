//B"H
//Boruch Hashem
//Blessed be He

const { ANNOTATIONS, SOURCE_ROOTS } = require("./config.cjs");
const { RICH_FILE, packedFile } = require("./candidate.cjs");
const { PostIndex } = require("./postIndex.cjs");
const { openReadOnly, readValue } = require("./storeCodec.cjs");
const richPaths = require("../../geelooy/api/social/helper/comments/richCommentPaths.js");

/**
 * @file Independent verifier for recovered Torah-source commentary.
 * @description The Awtsmoos demands agreement between body, parent, coordinate, identity, provenance, and reader indexes,
 * while Awtsmoos.com caches immutable index chambers so verification never decompresses the same proof thousands of times.
 */
const GENERATIONS = new Set(SOURCE_ROOTS.map(source => source.id));

function commentInodes(db) {
	return Object.values(db.__fs3Manifest?.inodes || {})
		.filter(inode => inode?.type === "file" && !inode.deleted)
		.filter(inode => /\/commentTree\/comments\/[^/]+\/data$/.test(inode.path || ""));
}

function commentIdFromPath(target) {
	return target.match(/\/comments\/([^/]+)\/data$/)?.[1] || "";
}

function cachedIds(rich, cache, target) {
	let ids = cache.get(target);
	if (ids) return ids;
	const value = readValue(rich, target, []);
	ids = new Set((Array.isArray(value) ? value : []).map(String));
	cache.set(target, ids);
	return ids;
}

function verifyAnnotation(comment, policy, id, failures) {
	const annotation = comment.dayuh?.torahAnnotation;
	const provenance = annotation?.provenance;
	if (!annotation) return failures.push({ id, code: "ANNOTATION_MISSING" });
	if (annotation.sourceId !== comment.aliasId) failures.push({ id, code: "SOURCE_ID_MISMATCH" });
	if (annotation.kind !== policy.kind) failures.push({ id, code: "KIND_MISMATCH" });
	if (annotation.language !== policy.language) failures.push({ id, code: "LANGUAGE_MISMATCH" });
	if (annotation.name !== policy.name) failures.push({ id, code: "NAME_MISMATCH" });
	if (annotation.coordinateBasis !== "reader-zero-based") failures.push({ id, code: "COORDINATE_BASIS_MISMATCH" });
	if (!GENERATIONS.has(provenance?.generation)) failures.push({ id, code: "PROVENANCE_GENERATION_INVALID" });
	if (provenance?.seriesId !== comment.seriesId) failures.push({ id, code: "PROVENANCE_SERIES_MISMATCH" });
	if (provenance?.postId !== comment.postId) failures.push({ id, code: "PROVENANCE_POST_MISMATCH" });
}

function verifyIndexes({ rich, comment, id, verse, indexCache, failures }) {
	const rootPath = richPaths.rootChildrenPath({ heichelId: "ikar", postId: comment.postId });
	const versePath = richPaths.verseIndexPath({ heichelId: "ikar", postId: comment.postId, verseSection: verse });
	if (!cachedIds(rich, indexCache, rootPath).has(String(id))) failures.push({ id, code: "ROOT_INDEX_MISSING" });
	if (!cachedIds(rich, indexCache, versePath).has(String(id))) failures.push({ id, code: "VERSE_INDEX_MISSING" });
}

function verifyOne({ rich, posts, inode, indexCache, failures }) {
	const comment = readValue(rich, inode.path, null);
	const id = commentIdFromPath(inode.path);
	if (!comment || comment.id !== id) return failures.push({ id, code: "BODY_ID_MISMATCH" });
	const policy = ANNOTATIONS[comment.aliasId];
	if (!policy) return failures.push({ id, code: "UNREVIEWED_ALIAS" });
	const sections = posts.sectionCount(comment.seriesId, comment.postId);
	const verse = Number(comment.verseSection);
	if (sections < 0) return failures.push({ id, code: "POST_MISSING" });
	if (!Number.isInteger(verse) || verse < 0 || verse >= sections) return failures.push({ id, code: "COORDINATE_OUT_OF_RANGE" });
	const unique = readValue(rich, richPaths.uniquePath({ commentId: id }), null);
	if (!unique || unique.postId !== comment.postId || unique.seriesId !== comment.seriesId) failures.push({ id, code: "UNIQUE_POINTER_MISSING" });
	verifyIndexes({ rich, comment, id, verse, indexCache, failures });
	verifyAnnotation(comment, policy, id, failures);
}

function verifyCandidate(root) {
	const rich = openReadOnly(packedFile(root, RICH_FILE));
	const posts = new PostIndex();
	const indexCache = new Map();
	const failures = [];
	let count = 0;
	try {
		for (const inode of commentInodes(rich)) {
			verifyOne({ rich, posts, inode, indexCache, failures });
			count++;
			if (failures.length >= 100) break;
		}
	} finally {
		try { rich.close(); } catch {}
		posts.close();
	}
	return { success: failures.length === 0 && count > 0, count, failures };
}

module.exports = { verifyCandidate };
