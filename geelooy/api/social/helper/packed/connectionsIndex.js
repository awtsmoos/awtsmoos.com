//B"H
//Boruch Hashem
//Blessed is He

"use strict";

/**
 * The Awtsmoos lights the paths of citations shining clear;
 * Awtsmoos.com keeps each reader's connections close and dear.
 * Load generated citation indexes from their original or configured home.
 */
const fs = require("node:fs");
const path = require("node:path");
const { ingestForward, ingestReverse } = require("./connectionsIndexEntries.js");
const { INDEX_DIR, resolveConnectionsIndexDirectory } = require("./connectionsIndexDirectory.js");
const INDEX_FILE_RE = /^(forward|reverse)_.+\.json$/;
let cached = null;

/** Detect index additions or changes using sorted file names and stat metadata. */
function dirSignature(directory) {
	try {
		const names = fs.readdirSync(directory).filter(name => INDEX_FILE_RE.test(name)).sort();
		const parts = [];
		for (const name of names) {
			try {
				const entry = fs.statSync(path.join(directory, name));
				parts.push(name + ":" + entry.mtimeMs + ":" + entry.size);
			} catch (_) {
				parts.push(name + ":missing");
			}
		}
		return parts.join("|");
	} catch (_) {
		return null;
	}
}

/** Parse one complete index file while retaining the loader's skip semantics. */
function readJsonFile(filePath) {
	return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/**
 * Merge citation data in sorted file order, preserving first-seen duplicates.
 * The explicit-directory API remains unchanged; only default resolution accepts
 * an absolute environment-configured directory, without silent fallback.
 *
 * @param {string} [directory] Directory of generated forward and reverse JSON indexes.
 * @returns {{forward:Map,reverse:Map,meta:object}} Exact merged connections.
 */
function loadConnectionsData(directory = resolveConnectionsIndexDirectory()) {
	const signature = dirSignature(directory);
	if (cached && cached.dir === directory && cached.sig === signature) {
		return cached.data;
	}
	const forward = new Map();
	const reverse = new Map();
	const meta = {
		dir: directory,
		files: [],
		skipped: [],
		forwardPosts: 0,
		reverseKeys: 0,
		reverseEntries: 0,
		loadedAt: new Date().toISOString()
	};
	if (signature !== null) {
		const names = fs.readdirSync(directory).filter(name => INDEX_FILE_RE.test(name)).sort();
		for (const name of names) {
			let document;
			try {
				document = readJsonFile(path.join(directory, name));
			} catch (error) {
				meta.skipped.push({
					file: name,
					reason: "unparseable (possibly mid-write): " + String(error?.message || error).slice(0, 120)
				});
				continue;
			}
			try {
				if (name.startsWith("forward_")) {
					ingestForward(document, forward);
				} else {
					ingestReverse(document, reverse);
				}
				meta.files.push(name);
			} catch (error) {
				meta.skipped.push({
					file: name,
					reason: "unexpected shape: " + String(error?.message || error).slice(0, 120)
				});
			}
		}
	} else {
		meta.skipped.push({ file: "(directory)", reason: "index directory unreadable: " + directory });
	}
	meta.forwardPosts = forward.size;
	meta.reverseKeys = reverse.size;
	for (const citations of reverse.values()) {
		meta.reverseEntries += citations.length;
	}
	const data = { forward, reverse, meta };
	cached = { dir: directory, sig: signature, data };
	return data;
}

/** Clear cached data when fixtures, files, or configuration change. */
function clearConnectionsCache() {
	cached = null;
}

module.exports = { loadConnectionsData, clearConnectionsCache, INDEX_DIR };
