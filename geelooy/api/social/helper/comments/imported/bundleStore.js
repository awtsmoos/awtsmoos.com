// B"H
// Boruch Hashem
// Blessed is He

const fs = require("fs");
const path = require("path");
const { LruCache } = require("./cache.js");

/** Reads manifest-gated imported Torah bundles from external runtime data. */
const manifests = new Map();
const posts = new LruCache(12, 300000);

// B"H — Yaakov 2026-10-15: bundles over 15MB live in AwtsmoosDB, never as JSON.
// Dual-read: AwtsmoosDB first, JSON files as fallback until Yaakov removes them.
// Semantic virtual-FS keys: /<bundle>/manifest.awtsmoosJSON and
// /<bundle>/posts/<seriesId>/<postId>.awtsmoosJSON
const dbHandles = new Map();

function dbFile() {
	try {
		const { resolveSocialShardRoot } = require("../../awtsmoosDb/shardRoot.js");
		return path.join(path.dirname(resolveSocialShardRoot()), "imported-comments.awtsmoosdb");
	} catch {
		return null;
	}
}

function dbForRead() {
	const file = dbFile();
	if (!file || !fs.existsSync(file)) return null;
	let mark = null;
	try {
		const status = fs.statSync(file);
		mark = `${status.dev}:${status.ino}:${status.size}:${status.mtimeMs}`;
	} catch {
		return null;
	}
	const current = dbHandles.get(file);
	if (current && current.mark === mark) return current.database;
	try { current?.database?.close(); } catch {}
	let database = null;
	try {
		const AwtsmoosDB = require("../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js");
		database = new AwtsmoosDB(file, {
			readOnly: true,
			readonly: true,
			wal: false,
			processLockMode: "shared",
			lockMode: "shared"
		});
		database.open();
	} catch {
		return null;
	}
	dbHandles.set(file, { database, mark });
	return database;
}

function dbReadVirtual(vpath) {
	const database = dbForRead();
	if (!database) return null;
	try {
		const awts = require("../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js");
		const target = vpath.endsWith(".awtsmoosJSON") ? vpath : `${vpath}.awtsmoosJSON`;
		const stat = database.fs.stat(target);
		if (!stat || !stat.exists || stat.type !== "file" || !stat.size) return null;
		return awts.deserializeBinary(database.fs.readRange(target, 0, stat.size));
	} catch {
		return null;
	}
}

function rootFor(bundle) {
	const configured = process.env.AWTSMOOS_IMPORTED_COMMENT_DATA_ROOT;
	const dataRoot = configured
		? path.resolve(configured)
		: path.join(__dirname, "data");
	return path.join(dataRoot, bundle);
}

function manifest(bundle) {
	const key = `${rootFor(bundle)}\0${bundle}`;
	if (manifests.has(key)) return manifests.get(key);
	// B"H — AwtsmoosDB first.
	const fromDb = dbReadVirtual(`/${bundle}/manifest`);
	if (fromDb && typeof fromDb === "object") {
		manifests.set(key, fromDb);
		return fromDb;
	}
	// JSON fallback.
	const file = path.join(rootFor(bundle), "manifest.json");
	const value = JSON.parse(fs.readFileSync(file, "utf8"));
	manifests.set(key, value);
	return value;
}

function postKey(seriesId, postId) {
	return `${seriesId}\0${postId}`;
}

function postIds(bundle, seriesId) {
	const value = manifest(bundle)?.series?.[seriesId];
	return Array.isArray(value) ? [...value] : [];
}

function safePostFile(bundle, seriesId, postId) {
	const root = rootFor(bundle);
	const relative = manifest(bundle)?.posts?.[postKey(seriesId, postId)];
	if (!relative || !relative.startsWith("posts/")) return null;
	const file = path.resolve(root, relative);
	if (!file.startsWith(`${path.resolve(root)}${path.sep}`)) return null;
	return file;
}

async function readPost(bundle, seriesId, postId) {
	const key = `${rootFor(bundle)}\0${bundle}\0${seriesId}\0${postId}`;
	const cached = posts.get(key);
	if (cached) return cached;
	// B"H — AwtsmoosDB first. DB-sourced entries carry file: null (no JSON
	// file backs them); consumers use payload only.
	const fromDb = dbReadVirtual(`/${bundle}/posts/${seriesId}/${postId}`);
	if (fromDb && typeof fromDb === "object") {
		return posts.set(key, { file: null, payload: fromDb });
	}
	// JSON fallback.
	const file = safePostFile(bundle, seriesId, postId);
	if (!file) return null;
	const payload = JSON.parse(await fs.promises.readFile(file, "utf8"));
	return posts.set(key, { file, payload });
}

function fingerprint(bundle) {
	return manifest(bundle)?.fingerprint || "bundle-unversioned";
}

module.exports = {
	fingerprint,
	manifest,
	postIds,
	readPost,
	rootFor,
	safePostFile
};
