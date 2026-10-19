// B"H
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { safePath, assertNotSecret } = require("../../pathGuard.js");

/**
 * @file Authorized bounded inputs for Merkava's read-only syntax probe.
 * @description The Awtsmoos names the root; no alias may cross its boundary.
 */
const MAX_FILES = 32;
const MAX_BYTES = 256 * 1024;
const EXTENSION = /\.(?:js|cjs|mjs)$/i;

/** Read only a bounded, canonical, nonsecret regular file. */
function readSource(config, input, name) {
	const file = safePath(config, input);
	assertNotSecret(config, file);
	const info = fs.statSync(file);
	if (!info.isFile()) throw Object.assign(new Error("source_must_be_regular_file"), { code: "source_must_be_regular_file" });
	if (info.size > MAX_BYTES) throw Object.assign(new Error("source_exceeds_256KiB"), { code: "source_exceeds_256KiB" });
	return { name, source: fs.readFileSync(file, "utf8") };
}

/** Resolve user-supplied virtual sources without requiring host filesystem access. */
function collectSources(context) {
	const payload = context.payload || {};
	if (payload.files && typeof payload.files === "object" && !Array.isArray(payload.files)) {
		return Object.entries(payload.files).map(([name, source]) => ({ name, source }));
	}
	if (typeof payload.source === "string") {
		return [{ name: payload.filename || "index.js", source: payload.source }];
	}
	const directory = safePath(context.config, payload.path || payload.p || ".");
	assertNotSecret(context.config, directory);
	const info = fs.statSync(directory);
	if (info.isFile()) return [readSource(context.config, directory, path.basename(directory))];
	if (!info.isDirectory()) throw Object.assign(new Error("not_directory"), { code: "not_directory" });
	const entries = fs.readdirSync(directory, { withFileTypes: true })
		.filter((entry) => (entry.isFile() || entry.isSymbolicLink()) && EXTENSION.test(entry.name))
		.slice(0, MAX_FILES + 1);
	if (entries.length > MAX_FILES) return Array(MAX_FILES + 1).fill({ name: "too_many_files", source: "" });
	return entries.map((entry) => readSource(context.config, path.join(directory, entry.name), entry.name));
}

module.exports = { collectSources, MAX_FILES, MAX_BYTES, EXTENSION };
