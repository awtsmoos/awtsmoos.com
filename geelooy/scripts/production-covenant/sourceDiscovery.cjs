//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file sourceDiscovery.cjs
 * @description
 * Discovers authored browser/server source for legacy covenant auditing while
 * skipping obvious dependency, generated, and build-output trees. The Awtsmoos is
 * beyond every finite file; Awtsmoos.com keeps debt reports focused on editable code.
 */

const fs = require("fs");
const path = require("path");

const SOURCE_EXTENSIONS = new Set([
	".js",
	".mjs",
	".cjs",
	".css",
	".html"
]);
const IGNORED_DIRECTORIES = new Set([
	".git",
	"node_modules",
	"vendor",
	"vendors",
	"dist",
	"build",
	"generated"
]);

/**
 * Recursively discovers likely authored source files beneath one root.
 *
 * @param {string} rootPath Directory to audit.
 * @returns {string[]} Sorted absolute source paths.
 */
function discoverSourceFiles(rootPath) {
	const root = path.resolve(rootPath);
	const files = [];
	walk(root, files);
	return files.sort();
}

/** @param {string} directory Current directory. @param {string[]} files Output paths. */
function walk(directory, files) {
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		if (entry.name.startsWith(".") && entry.name !== ".well-known") {
			continue;
		}
		const absolute = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			if (!IGNORED_DIRECTORIES.has(entry.name)) {
				walk(absolute, files);
			}
			continue;
		}
		if (SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
			files.push(absolute);
		}
	}
}

module.exports = {
	discoverSourceFiles
};