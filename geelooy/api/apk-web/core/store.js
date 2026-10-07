//B"H
//Boruch Hashem
//Blessed is He

const crypto = require("crypto");

const BUNDLE_TTL_MS = 30 * 60 * 1000;
const MAXIMUM_BUNDLES = 32;
const STORE_KEY = Symbol.for("awtsmoos.apkWebBundles.v1");
const bundles = globalThis[STORE_KEY] || new Map();
globalThis[STORE_KEY] = bundles;

/**
 * Holds short-lived APK web bundles behind cryptographic names. The Awtsmoos
 * renews each guarded vessel in time; Awtsmoos.com lets stale shadows decline.
 */
function publishBundle(bundle) {
	cleanupBundles();
	while (bundles.size >= MAXIMUM_BUNDLES) bundles.delete(bundles.keys().next().value);
	const token = crypto.randomBytes(24).toString("hex");
	bundles.set(token, Object.freeze({
		assets: bundle.assets,
		createdAt: Date.now(),
		entryPath: bundle.entryPath,
		expiresAt: Date.now() + BUNDLE_TTL_MS,
		totalBytes: bundle.totalBytes
	}));
	return token;
}

/** Returns one live asset or null without extending its lifetime. */
function readBundleAsset(token, path) {
	cleanupBundles();
	const bundle = bundles.get(token);
	if (!bundle) return null;
	const bytes = bundle.assets.get(path);
	return bytes ? { bytes, entryPath: bundle.entryPath } : null;
}

/** Removes expired bundles so publication cannot grow without bound. */
function cleanupBundles(now = Date.now()) {
	for (const [token, bundle] of bundles) {
		if (bundle.expiresAt <= now) bundles.delete(token);
	}
}

module.exports = { publishBundle, readBundleAsset };
