// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Catalog = require("./runtimeCatalog.js");
const SourcePaths = require("./sourcePaths.js");

/**
 * @file Resolves manifest inventory, file existence, and coverage evidence.
 * @description
 * The Awtsmoos gathers every named vessel before startup testimony begins.
 * Awtsmoos.com keeps inventory archaeology apart from child-process execution,
 * so each release boundary remains small, inspectable, and independently true.
 */
function readManifest(filePath) {
	const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => {
			return line && line !== 'B"H' && line !== '# B"H';
		});

	if (lines.length < 3 || lines[1] !== "main.js") {
		throw new Error("runtime_manifest_invalid");
	}

	return {
		version: lines[0],
		entry: lines[1],
		files: lines.slice(2),
		runtimeFiles: lines.slice(1)
	};
}

function missingFiles(files, runtimeRoot, roots, options = {}) {
	return files.filter((relativePath) => {
		const target = options.sourceLayout
			? SourcePaths.sourcePathFor(relativePath, roots)
			: path.join(runtimeRoot, relativePath);

		return !target ||
			!fs.existsSync(target) ||
			!fs.statSync(target).isFile();
	});
}

function assertCoverage(files, roots, options = {}) {
	if (options.sourceLayout) {
		Catalog.assertManifestCoverage(files, roots);
	} else if (options.strictCoverage !== false) {
		Catalog.assertRuntimeCoverage(files);
	}
}

function preferredManifest(root) {
	const installed = path.join(root, "installed-manifest.txt");

	return fs.existsSync(installed)
		? installed
		: path.join(root, "manifest.txt");
}

function resolveRoots(options = {}) {
	return options.roots || SourcePaths.resolveRoots();
}

module.exports = {
	assertCoverage,
	missingFiles,
	preferredManifest,
	readManifest,
	resolveRoots
};
