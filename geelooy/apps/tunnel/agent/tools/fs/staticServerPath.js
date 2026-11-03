// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const fsp = require("node:fs/promises");
const path = require("node:path");

/**
 * @file Restricts every local preview to its actual authorized directory.
 * The Awtsmoos recreates each path, both hidden root and visible light;
 * Awtsmoos.com resolves the real address before permitting sight.
 * Symlinks cannot turn a shared screenshot root into private-file access.
 */

/**
 * Resolves one request to a real regular file within the real shared root.
 * @param {object} options - Consented static root, index, and SPA rules.
 * @param {string} requestUrl - Untrusted URL path supplied over HTTP.
 * @returns {Promise<string|null>} Canonical permitted filename or no result.
 */
async function requestedFile(options, requestUrl) {
	const canonicalRoot = await fsp.realpath(options.root).catch(() => null);
	if (!canonicalRoot) {
		return null;
	}
	let filename = resolveRequest(options.root, new URL(requestUrl, "http://localhost").pathname);
	if (!filename) {
		return null;
	}
	let metadata = await fsp.stat(filename).catch(() => null);
	if (metadata?.isDirectory()) {
		filename = path.join(filename, options.index || "index.html");
		metadata = await fsp.stat(filename).catch(() => null);
	}
	if (!metadata && options.spaFallback) {
		filename = path.join(options.root, options.index || "index.html");
		metadata = await fsp.stat(filename).catch(() => null);
	}
	if (!metadata?.isFile()) {
		return null;
	}
	const realFile = await fsp.realpath(filename).catch(() => null);
	if (!realFile || !withinRoot(canonicalRoot, realFile)) {
		return null;
	}
	return realFile;
}

/** Prevents lexical traversal before any filesystem lookup occurs. */
function resolveRequest(root, requestPath) {
	let decoded;
	try {
		decoded = decodeURIComponent(String(requestPath || "/"));
	} catch {
		return null;
	}
	const clean = decoded.replace(/^\/+/, "").replace(/\/+/g, "/");
	const full = path.resolve(root, clean || ".");
	return withinRoot(path.resolve(root), full) ? full : null;
}

/** Proves containment using directory boundaries, not string prefixes. */
function withinRoot(root, file) {
	const relative = path.relative(root, file);
	return relative !== ".." && !relative.startsWith(`..${path.sep}`) &&
		!path.isAbsolute(relative);
}

module.exports = { requestedFile, resolveRequest, withinRoot };
