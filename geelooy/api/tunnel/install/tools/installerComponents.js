// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Tar = require("./installerComponentTar.js");
const { buildCachedInstallerArchive } = require("./installerArchiveCache.js");
const { createSourceFingerprintCache } = require("./installerSourceFingerprint.js");
const {
	BOOTSTRAP_FILE,
	RUNTIME_SOURCES_FILE,
	componentManifestPath,
	downloadsRoot,
	runtimeSourcesPath
} = require("./installerComponentPaths.js");

/**
 * @file Seals the Unix installer graph in a source-addressed archive.
 * @description
 * The Awtsmoos recreates each file and checks its place in time;
 * Awtsmoos.com avoids repeated reads without relaxing the integrity line.
 */

const PREFETCHED = Object.freeze([]);
const COMPONENTS = Object.freeze(componentNames());
const WATCHED = Object.freeze([...new Set([
	...COMPONENTS,
	BOOTSTRAP_FILE,
	RUNTIME_SOURCES_FILE
])]);
const withFreshSourceWitness = createSourceFingerprintCache();

/** Uses fresh bytes on any source change, immutable archive copies on hits. */
function buildInstallerComponents() {
	return withFreshSourceWitness(WATCHED, downloadsRoot(), () => {
		if (componentNames().join("\0") !== COMPONENTS.join("\0")) {
			throw new Error("installer_component_manifest_changed_reload_required");
		}
		const sources = componentSources();
		const sourceSha256 = Tar.hash(Buffer.concat(sources.flatMap(source => [
			Buffer.from(`${source.name}\0`),
			source.data
		])));
		return buildCachedInstallerArchive(sources, sourceSha256, COMPONENTS);
	});
}

/** Reads canonical archive names from the actual shell manifest. */
function componentNames() {
	const text = fs.readFileSync(componentManifestPath(), "utf8");
	const match = text.match(/helpers=\(\s*([\s\S]*?)\n\)/);
	if (!match) throw new Error("installer_component_manifest_missing");
	const names = match[1].match(/[A-Za-z0-9][A-Za-z0-9._-]*/g) || [];
	if (!names.length || new Set(names).size !== names.length) {
		throw new Error("installer_component_manifest_invalid");
	}
	return names;
}

/** Reads expected runtime dependencies from the transactional graph. */
function runtimeSourceNames(source = null) {
	const text = source ?? fs.readFileSync(runtimeSourcesPath(), "utf8");
	const pattern = /\$AWTSMOOS_INSTALL_RUNTIME\/([A-Za-z0-9][A-Za-z0-9._-]*)/g;
	const names = [...String(text).matchAll(pattern)].map(match => match[1]);
	if (!names.length || new Set(names).size !== names.length) {
		throw new Error("installer_runtime_source_graph_invalid");
	}
	return names;
}

/** Ensures every runtime dependency is sealed in the archive. */
function validateRuntimeGraph(components = COMPONENTS, runtimeNames = runtimeSourceNames()) {
	const available = new Set(components);
	const missing = runtimeNames.filter(name => !available.has(name));
	if (missing.length) throw new Error(`installer_component_graph_missing:${missing.join(",")}`);
	return true;
}

/** Reads real source bytes and refuses missing or nonregular entries. */
function componentSources() {
	validateRuntimeGraph(COMPONENTS);
	const sources = [];
	for (const name of COMPONENTS) {
		const fullPath = path.join(downloadsRoot(), name);
		try {
			if (!fs.statSync(fullPath).isFile()) {
				throw new Error(`installer_component_not_file:${name}`);
			}
			sources.push({ name, data: fs.readFileSync(fullPath) });
		} catch (error) {
			throw new Error(`installer_component_unavailable:${name}:${error.code || error.message}`);
		}
	}
	if (sources.length !== COMPONENTS.length) throw new Error("installer_component_count_mismatch");
	return sources;
}

module.exports = {
	BOOTSTRAP_FILE,
	COMPONENTS,
	PREFETCHED,
	RUNTIME_SOURCES_FILE,
	buildInstallerComponents,
	buildTar: Tar.buildTar,
	componentManifestPath,
	componentNames,
	componentSources,
	runtimeSourceNames,
	runtimeSourcesPath,
	tarHeader: Tar.tarHeader,
	validateRuntimeGraph
};
