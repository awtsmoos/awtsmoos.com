// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MeluketPackedDb
 * @description
 * Opens the verified packed-post working copy with shared read-only locks,
 * reveals one known month bundle, and closes every pager after the reading.
 */

const AwtsmoosDB = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB");
const binaryJson = require(
	"../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON"
);
const {
	PACKED_POSTS_FILE,
	sourceBundlePath
} = require("./meluketRepairConstants.js");

function openPackedPosts() {
	const database = new AwtsmoosDB(PACKED_POSTS_FILE, {
		readOnly: true,
		readonly: true,
		wal: false,
		processLockMode: "shared",
		lockMode: "shared"
	});
	database.open();
	database.fs.ready();
	return database;
}

function closePackedPosts(database) {
	try {
		database.pager?.close?.();
		database.processLock?.release?.();
	} catch {
		// Read-only source closure is best-effort after successful reads.
	}
}

function readPackedBundle(database, sourceId) {
	const logicalPath = sourceBundlePath(sourceId);
	const stat = database.fs.stat(logicalPath);
	if (!stat?.exists || !stat.size) {
		throw new Error(`Missing packed Meluket bundle: ${logicalPath}`);
	}
	const bytes = database.fs.readRange(logicalPath, 0, stat.size);
	const value = binaryJson.deserializeBinary(bytes);
	if (!value || typeof value !== "object" || Buffer.isBuffer(value)) {
		throw new Error(`Invalid packed Meluket bundle: ${logicalPath}`);
	}
	const posts = Object.fromEntries(Object.entries(value).filter(
		([postId]) => postId !== "$awtsmoosObjectShape"
	));
	return {
		logicalPath,
		posts,
		size: stat.size
	};
}

module.exports = {
	closePackedPosts,
	openPackedPosts,
	readPackedBundle
};
