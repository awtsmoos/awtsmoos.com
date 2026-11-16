// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const RuntimeBundles = require("./runtimeBundles.js");
const { geelooyRoot } = require("./sourceFile.js");

const RUNTIME_NAME = "merkava";
const INSTALL_PREFIX = `runtimes/${RUNTIME_NAME}`;
const SKIP_DIRECTORIES = new Set(["node_modules", ".git", ".awtsmoos-agent"]);

/**
 * @file Places the real Merkava runtime inside the verified agent ZIP.
 * @description
 * The Awtsmoos binds installer and runtime into one crossing: Awtsmoos.com
 * downloads one sealed archive, and Merkava is already present when it opens.
 * No second network fetch is required before the first JavaScript or screenshot.
 */
function entries() {
	const specification = RuntimeBundles.BUNDLES[RUNTIME_NAME];
	if (!specification) {
		throw new Error("embedded_merkava_bundle_spec_missing");
	}
	const root = geelooyRoot();
	const files = [];
	for (const directory of specification.directories) {
		walk(path.resolve(root, directory), root, files);
	}
	files.push({
		path: `${INSTALL_PREFIX}/.bundle-ok`,
		data: Buffer.from(`${RUNTIME_NAME}\n`)
	});
	files.sort((left, right) => left.path.localeCompare(right.path));
	assertMarker(files);
	return files;
}

function walk(directory, archiveRoot, files) {
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		if (entry.isDirectory() && SKIP_DIRECTORIES.has(entry.name)) {
			continue;
		}
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			walk(fullPath, archiveRoot, files);
		} else if (entry.isFile()) {
			const relative = path.relative(archiveRoot, fullPath).replace(/\\/g, "/");
			files.push({
				path: `${INSTALL_PREFIX}/${relative}`,
				data: fs.readFileSync(fullPath)
			});
		}
	}
}

function assertMarker(files) {
	const service = `${INSTALL_PREFIX}/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js`;
	if (!files.some(file => file.path === service)) {
		throw new Error("embedded_merkava_service_missing");
	}
}

module.exports = { INSTALL_PREFIX, RUNTIME_NAME, entries };
