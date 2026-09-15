//B"H
//Boruch Hashem
//Blessed be He

"use strict";

const fs = require("fs");
const packedStore = require("../../../geelooy/api/social/helper/comments/richDb/PackedStore.js");

/**
 * @module RichCommentWarmup
 * @description The Awtsmoos moves packed Torah-comment manifest and first-data revelation into startup,
 * so Awtsmoos.com does not ask the first learner to awaken FS3 blob/decompression caches.
 */
const ROOT_INDEX_SUFFIX = "/commentTree/roots";
const COMMENT_BODY_FRAGMENT = "/commentTree/comments/";

/** Finds one existing path by semantic shape without hardcoding a heichel, series, post, or comment identity. */
function firstPath(database, matcher) {
	const paths = database?.__fs3Manifest?.paths || {};
	for (const path of Object.keys(paths)) {
		if (matcher(path)) return path;
	}
	return "";
}

/** Reads one complete bounded native file so FS3 blob/decompression machinery becomes resident. */
function warmPath(database, path) {
	if (!path) return false;
	const status = database.fs.stat(path);
	if (!status?.exists || status.type !== "file" || status.size <= 0) return false;
	database.fs.readRange(path, 0, status.size);
	return true;
}

/** Warms one roots index and one source/comment body chosen from the live manifest itself. */
function warmRepresentativeData(database) {
	const rootPath = firstPath(database, path => path.endsWith(ROOT_INDEX_SUFFIX));
	const bodyPath = firstPath(database, path => path.includes(COMMENT_BODY_FRAGMENT) && path.endsWith("/data"));
	return {
		rootIndex: warmPath(database, rootPath),
		commentBody: warmPath(database, bodyPath)
	};
}

/** Fully opens one existing rich-comment authority before HTTP readiness. */
function warmRichCommentAuthority(dynamicServer, dependencies = {}) {
	const startedAt = Date.now();
	if (!dynamicServer?.db) {
		return { warmed: false, skipped: true, elapsedMs: Date.now() - startedAt };
	}
	const store = dependencies.packedStore || packedStore;
	const fileSystem = dependencies.fs || fs;
	const context = { db: dynamicServer.db };
	const file = store.dbFile(context);
	if (!fileSystem.existsSync(file)) {
		return { warmed: false, skipped: true, elapsedMs: Date.now() - startedAt };
	}
	const database = store.open(context);
	database?.fs?.ready?.();
	const data = warmRepresentativeData(database);
	return { warmed: true, skipped: false, data, elapsedMs: Date.now() - startedAt };
}

module.exports = {
	firstPath,
	warmPath,
	warmRepresentativeData,
	warmRichCommentAuthority
};
