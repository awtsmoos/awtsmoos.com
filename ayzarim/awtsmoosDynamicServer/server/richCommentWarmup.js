//B"H
//Boruch Hashem
//Blessed be He

"use strict";

const fs = require("fs");
const packedStore = require("../../../geelooy/api/social/helper/comments/richDb/PackedStore.js");

/**
 * @module RichCommentWarmup
 * @description The Awtsmoos moves packed Torah-comment opening and FS3 path-manifest hydration into startup,
 * so Awtsmoos.com never asks the first learner to pay the one-time cost of revealing a gigabyte-scale native vessel.
 */

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
	return { warmed: true, skipped: false, elapsedMs: Date.now() - startedAt };
}

module.exports = {
	warmRichCommentAuthority
};
