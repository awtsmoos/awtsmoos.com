// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const GitIndex = require("./runtimeGitIndex.js");
const Paths = require("./runtimePaths.js");
const SourcePaths = require("./sourcePaths.js");

const AGENT_METADATA = new Set(["main.js", "manifest.txt"]);

/**
 * @file Builds release inventory from deliberate Git-index membership.
 * @description
 * The Awtsmoos gathers only vessels explicitly offered for release. Awtsmoos.com
 * keeps ambient untracked work outside the manifest while staged additions enter
 * deterministically and missing indexed source still stops publication.
 */
function agentFiles(roots = SourcePaths.resolveRoots(), indexed = GitIndex.indexedFiles(roots)) {
	assertDirectory(roots.agentRoot, "agent_runtime_directory_missing");
	return GitIndex.filesBelow(roots.agentRoot, "", roots, indexed, Paths.isProductionPath)
		.filter(relative => !AGENT_METADATA.has(relative));
}

function externalFiles(roots = SourcePaths.resolveRoots(), indexed = GitIndex.indexedFiles(roots)) {
	return Paths.EXTERNAL_DIRECTORIES.flatMap(relative => {
		const sourceRoot = SourcePaths.sourcePathFor(relative, roots);
		assertDirectory(sourceRoot, `external_runtime_directory_missing:${relative}`);
		return GitIndex.filesBelow(sourceRoot, relative, roots, indexed, Paths.isProductionPath);
	});
}

function collect(_currentFiles = [], roots = SourcePaths.resolveRoots()) {
	const indexed = GitIndex.indexedFiles(roots);
	const ordered = [...new Set([
		...agentFiles(roots, indexed),
		...externalFiles(roots, indexed)
	])]
		.filter(file => file !== "main.js" && Paths.isProductionPath(file))
		.sort((left, right) => left.localeCompare(right));
	assertCriticalCoverage(ordered);
	assertSourceFiles(ordered, roots);
	return ordered;
}

function assertManifestCoverage(files, roots = SourcePaths.resolveRoots()) {
	const values = Array.isArray(files) ? files.map(SourcePaths.slash) : [];
	const expected = collect([], roots);
	const expectedSet = new Set(expected);
	const duplicates = values.filter((file, index) => values.indexOf(file) !== index);
	const forbidden = values.filter(file => file === "main.js" || !Paths.isProductionPath(file));
	const missing = expected.filter(file => !values.includes(file));
	const unexpected = values.filter(file => !expectedSet.has(file));
	if (duplicates.length) throw new Error(`manifest_duplicate_path:${unique(duplicates).join(",")}`);
	if (forbidden.length) throw new Error(`manifest_forbidden_path:${unique(forbidden).join(",")}`);
	if (missing.length) throw new Error(`manifest_dependency_omission:${missing.join(",")}`);
	if (unexpected.length) throw new Error(`manifest_stale_path:${unique(unexpected).join(",")}`);
	assertSourceFiles(values, roots);
	return { ok: true, files: values.length };
}

function assertRuntimeCoverage(files) {
	const available = new Set(files);
	const missing = Paths.REQUIRED_STARTUP_FILES
		.filter(file => file !== "main.js" && !available.has(file));
	if (missing.length) throw new Error(`runtime_dependency_omission:${missing.join(",")}`);
	return { ok: true, files: files.length };
}

function assertCriticalCoverage(files) {
	const available = new Set(files);
	const missing = Paths.REQUIRED_STARTUP_FILES
		.filter(file => file !== "main.js" && !available.has(file));
	if (missing.length) throw new Error(`source_dependency_omission:${missing.join(",")}`);
}

function assertSourceFiles(files, roots = SourcePaths.resolveRoots()) {
	const missing = files.filter(file => {
		const source = SourcePaths.sourcePathFor(file, roots);
		return !source || !fs.existsSync(source) || !fs.statSync(source).isFile();
	});
	if (missing.length) throw new Error(`manifest_source_missing:${missing.slice(0, 30).join(",")}`);
}

function assertDirectory(directory, error) {
	if (!directory || !fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
		throw new Error(error);
	}
}

function unique(values) { return [...new Set(values)]; }

module.exports = {
	agentFiles,
	assertManifestCoverage,
	assertRuntimeCoverage,
	assertSourceFiles,
	collect,
	externalFiles,
	indexedFiles: GitIndex.indexedFiles
};
