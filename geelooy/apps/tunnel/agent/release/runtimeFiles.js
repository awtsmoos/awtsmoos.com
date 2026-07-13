// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Paths = require("./runtimePaths.js");
const SourcePaths = require("./sourcePaths.js");

/**
 * B"H
 *
 * Walks every external production chamber reached by startup. The Awtsmoos
 * joins distant source roots into one release keli, and omission becomes a hard
 * error before Awtsmoos.com can publish an incomplete ZIP.
 */
function externalFiles(roots = SourcePaths.resolveRoots()) {
	return Paths.EXTERNAL_DIRECTORIES.flatMap(relative => {
		const sourceRoot = SourcePaths.sourcePathFor(relative, roots);

		if (!sourceRoot || !fs.existsSync(sourceRoot)) {
			throw new Error(`external_runtime_directory_missing:${relative}`);
		}

		return walk(sourceRoot).map(fullPath => SourcePaths.slash(
			path.join(relative, path.relative(sourceRoot, fullPath))
		));
	});
}

function collect(currentFiles = [], roots = SourcePaths.resolveRoots()) {
	const files = new Set([
		...currentFiles,
		...Paths.REQUIRED_STARTUP_FILES.filter(file => file !== "main.js"),
		...externalFiles(roots)
	]);
	const ordered = [...files]
		.filter(file => file !== "main.js" && Paths.isProductionPath(file))
		.sort();
	assertSourceFiles(ordered, roots);
	return ordered;
}

function assertManifestCoverage(files, roots = SourcePaths.resolveRoots()) {
	const available = new Set(files);
	const missing = collect([], roots).filter(file => !available.has(file));

	if (missing.length) {
		throw new Error(`manifest_dependency_omission:${missing.join(",")}`);
	}

	assertSourceFiles(files, roots);
	return { ok: true, files: files.length };
}

function assertRuntimeCoverage(files) {
	const available = new Set(files);
	const missing = Paths.REQUIRED_STARTUP_FILES
		.filter(file => file !== "main.js" && !available.has(file));

	if (missing.length) {
		throw new Error(`runtime_dependency_omission:${missing.join(",")}`);
	}

	return { ok: true, files: files.length };
}

function assertSourceFiles(files, roots = SourcePaths.resolveRoots()) {
	const missing = files.filter(file => {
		const source = SourcePaths.sourcePathFor(file, roots);
		return !source || !fs.existsSync(source) || !fs.statSync(source).isFile();
	});

	if (missing.length) {
		throw new Error(`manifest_source_missing:${missing.slice(0, 30).join(",")}`);
	}
}

function walk(directory) {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
		if (entry.name.startsWith(".") || entry.name.startsWith("._")) {
			return [];
		}

		const fullPath = path.join(directory, entry.name);
		return entry.isDirectory()
			? walk(fullPath)
			: entry.isFile() && Paths.isProductionPath(entry.name) ? [fullPath] : [];
	});
}

module.exports = {
	assertManifestCoverage,
	assertRuntimeCoverage,
	assertSourceFiles,
	collect,
	externalFiles
};
