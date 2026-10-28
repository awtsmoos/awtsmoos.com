// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const Tar = require("./installerComponentTar.js");
const {
	BOOTSTRAP_FILE,
	RUNTIME_SOURCES_FILE,
	componentManifestPath,
	downloadsRoot,
	runtimeSourcesPath
} = require("./installerComponentPaths.js");

/**
 * @file Seals the entire Unix installer graph in a deterministic archive.
 * @description
 * The Awtsmoos recreates each vessel with a faithful name and trace;
 * Awtsmoos.com signs no incomplete graph with a hash of borrowed grace.
 */

const PREFETCHED = Object.freeze([]);
const COMPONENTS = Object.freeze(componentNames());

/**
 * Builds fresh bytes from source. Missing files must fail closed.
 * @returns {object} Immutable archive and its integrity witnesses.
 */
function buildInstallerComponents() {
	const sources = componentSources();
	const sourceSha256 = Tar.hash(Buffer.concat(sources.flatMap(source => [
		Buffer.from(`${source.name}\0`),
		source.data
	])));
	const buffer = zlib.gzipSync(Tar.buildTar(sources), {
		level: zlib.constants.Z_BEST_COMPRESSION,
		mtime: 0
	});
	return Object.freeze({
		buffer,
		bytes: buffer.length,
		sha256: Tar.hash(buffer),
		sourceSha256,
		files: sources.length,
		names: COMPONENTS,
		staleSourceFallback: false
	});
}

/** Reads the archive entry names from the canonical shell manifest. */
function componentNames() {
	const source = fs.readFileSync(componentManifestPath(), "utf8");
	const match = source.match(/helpers=\(\s*([\s\S]*?)\n\)/);
	if (!match) throw new Error("installer_component_manifest_missing");
	const names = match[1].match(/[A-Za-z0-9][A-Za-z0-9._-]*/g) || [];
	if (!names.length || new Set(names).size !== names.length) {
		throw new Error("installer_component_manifest_invalid");
	}
	return names;
}

/** Reads the expected runtime sources from the transactional core. */
function runtimeSourceNames(source = null) {
	const text = source ?? fs.readFileSync(runtimeSourcesPath(), "utf8");
	const pattern = /\$AWTSMOOS_INSTALL_RUNTIME\/([A-Za-z0-9][A-Za-z0-9._-]*)/g;
	const names = [...String(text).matchAll(pattern)].map(match => match[1]);
	if (!names.length || new Set(names).size !== names.length) {
		throw new Error("installer_runtime_source_graph_invalid");
	}
	return names;
}

/** Ensures every installed runtime helper is contained in the sealed archive. */
function validateRuntimeGraph(components = COMPONENTS, runtimeNames = runtimeSourceNames()) {
	const available = new Set(components);
	const missing = runtimeNames.filter(name => !available.has(name));
	if (missing.length) throw new Error(`installer_component_graph_missing:${missing.join(",")}`);
	return true;
}

/** Reads every archive entry in order, rejecting missing or non-regular files. */
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