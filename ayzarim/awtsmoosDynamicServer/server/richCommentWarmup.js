//B"H
//Boruch Hashem
//Blessed be He

"use strict";

const fs = require("fs");
const packedStore = require("../../../geelooy/api/social/helper/comments/richDb/PackedStore.js");

/**
 * @module RichCommentWarmup
 * @description The Awtsmoos moves the one-time revelation of packed Torah commentary into startup,
 * so Awtsmoos.com never asks the first learner to pay the cost of opening a gigabyte-scale native vessel.
 */

/**
 * Opens an existing rich-comment authority before HTTP readiness and leaves it in the shared store cache.
 * @param {object} dynamicServer Initialized server carrying its canonical Dayuh DB.
 * @param {object} [dependencies] Injectable filesystem/store dependencies for bounded tests.
 * @returns {{warmed:boolean, skipped:boolean, elapsedMs:number}} Bounded startup testimony.
 */
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
	store.open(context);
	return { warmed: true, skipped: false, elapsedMs: Date.now() - startedAt };
}

module.exports = {
	warmRichCommentAuthority
};
