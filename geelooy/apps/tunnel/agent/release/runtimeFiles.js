// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Paths = require("./runtimePaths.js");
const SourcePaths = require("./sourcePaths.js");

const AGENT_METADATA = new Set(["main.js", "manifest.txt"]);

/**
 * Inventories the agent source tree from disk. New production modules enter the
 * release automatically and deleted modules leave it automatically; yesterday's
 * manifest can no longer conceal today's dependency graph.
 */
function agentFiles(roots = SourcePaths.resolveRoots()) {
	assertDirectory(roots.agentRoot, "agent_runtime_directory_missing");
	return walk(roots.agentRoot)
		.map(fullPath => SourcePaths.slash(path.relative(roots.agentRoot, fullPath)))
		.filter(relative => !AGENT_METADATA.has(relative));
}

/** Inventories every configured production vessel outside the agent root. */
function externalFiles(roots = SourcePaths.resolveRoots()) {
	return Paths.EXTERNAL_DIRECTORIES.flatMap(relative => {
		const sourceRoot = SourcePaths.sourcePathFor(relative, roots);
		assertDirectory(sourceRoot, `external_runtime_directory_missing:${relative}`);
		return walk(sourceRoot).map(fullPath => SourcePaths.slash(
			path.join(relative, path.relative(sourceRoot, fullPath))
		));
	});
}

/** Returns the one authoritative, deterministic production manifest inventory. */
function collect(_currentFiles = [], roots = SourcePaths.resolveRoots()) {
	const ordered = [...new Set([...agentFiles(roots), ...externalFiles(roots)])]
		.filter(file => file !== "main.js" && Paths.isProductionPath(file))
		.sort((left, right) => left.localeCompare(right));
	assertCriticalCoverage(ordered);
	assertSourceFiles(ordered, roots);
	return ordered;
}

/**
 * Publication requires an exact match, not merely the presence of a small list.
 * Missing, stale, forbidden, and duplicate entries each stop the release.
 */
function assertManifestCoverage(files, roots = SourcePaths.resolveRoots()) {
	const values = Array.isArray(files) ? files.map(SourcePaths.slash) : [];
	const available = new Set(values);
	const expected = collect([], roots);
	const expectedSet = new Set(expected);
	const duplicates = values.filter((file, index) => values.indexOf(file) !== index);
	const forbidden = values.filter(file => file === "main.js" || !Paths.isProductionPath(file));
	const missing = expected.filter(file => !available.has(file));
	const unexpected = values.filter(file => !expectedSet.has(file));

	if (duplicates.length) throw new Error(`manifest_duplicate_path:${unique(duplicates).join(",")}`);
	if (forbidden.length) throw new Error(`manifest_forbidden_path:${unique(forbidden).join(",")}`);
	if (missing.length) throw new Error(`manifest_dependency_omission:${missing.join(",")}`);
	if (unexpected.length) throw new Error(`manifest_stale_path:${unique(unexpected).join(",")}`);
	assertSourceFiles(values, roots);
	return { ok: true, files: values.length };
}

/** Installed candidates retain a compact set of non-negotiable startup checks. */
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

function walk(directory, relative = "") {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
		const entryRelative = SourcePaths.slash(path.join(relative, entry.name));
		if (!Paths.isProductionPath(entryRelative)) return [];
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) return walk(fullPath, entryRelative);
		return entry.isFile() ? [fullPath] : [];
	});
}

function unique(values) {
	return [...new Set(values)];
}

module.exports = {
	agentFiles,
	assertManifestCoverage,
	assertRuntimeCoverage,
	assertSourceFiles,
	collect,
	externalFiles,
	walk
};
