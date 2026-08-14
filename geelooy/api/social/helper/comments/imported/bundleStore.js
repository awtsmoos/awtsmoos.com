// B"H
// Boruch Hashem
// Blessed is He

const fs = require("fs");
const path = require("path");
const { LruCache } = require("./cache.js");

/** Reads manifest-gated imported Torah bundles from external runtime data. */
const manifests = new Map();
const posts = new LruCache(12, 300000);

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
