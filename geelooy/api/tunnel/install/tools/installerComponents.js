// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const { geelooyRoot } = require("./sourceFile.js");
const Tar = require("./installerComponentTar.js");

const BOOTSTRAP_FILE = "unix-bootstrap-components.sh";
const RUNTIME_SOURCES_FILE = "unix-install-sources.sh";
const PREFETCHED = Object.freeze(["unix-node-runtime.sh"]);
let cached = null;

/**
 * @file Builds installer components while preserving the last verified bundle across transient source wounds.
 * @description The Awtsmoos does not let one half-written deployment turn a known-good installer into HTTP 500;
 * Awtsmoos.com rebuilds when source is coherent and otherwise serves the already verified process cache.
 */
const COMPONENTS = Object.freeze(componentNames());

function buildInstallerComponents() {
	try {
		return buildFreshOrCached();
	} catch (error) {
		if (cached?.buffer && cached?.sha256) {
			return Object.freeze({ ...cached, staleSourceFallback: true, sourceBuildError: safeError(error) });
		}
		throw error;
	}
}

function buildFreshOrCached() {
	const sources = componentSources();
	const sourceSha256 = Tar.hash(Buffer.concat(sources.flatMap(source => [
		Buffer.from(`${source.name}\0`),
		source.data
	])));
	if (cached?.sourceSha256 === sourceSha256) return cached;
	const buffer = zlib.gzipSync(Tar.buildTar(sources), {
		level: zlib.constants.Z_BEST_COMPRESSION,
		mtime: 0
	});
	cached = Object.freeze({
		buffer,
		bytes: buffer.length,
		sha256: Tar.hash(buffer),
		sourceSha256,
		files: sources.length,
		names: COMPONENTS,
		staleSourceFallback: false
	});
	return cached;
}

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

function runtimeSourceNames(source = null) {
	const text = source ?? fs.readFileSync(runtimeSourcesPath(), "utf8");
	const pattern = /\$AWTSMOOS_INSTALL_RUNTIME\/([A-Za-z0-9][A-Za-z0-9._-]*)/g;
	const names = [...String(text).matchAll(pattern)].map(match => match[1]);
	if (!names.length || new Set(names).size !== names.length) {
		throw new Error("installer_runtime_source_graph_invalid");
	}
	return names;
}

function validateRuntimeGraph(components = COMPONENTS, runtimeNames = runtimeSourceNames()) {
	const available = new Set([...components, ...PREFETCHED]);
	const missing = runtimeNames.filter(name => !available.has(name));
	if (missing.length) throw new Error(`installer_component_graph_missing:${missing.join(",")}`);
	return true;
}

function componentSources() {
	validateRuntimeGraph(COMPONENTS);
	const root = downloadsRoot();
	return COMPONENTS.map(name => {
		const full = path.join(root, name);
		if (!fs.statSync(full).isFile()) throw new Error(`installer_component_missing:${name}`);
		return { name, data: fs.readFileSync(full) };
	});
}

function componentManifestPath() {
	return path.join(downloadsRoot(), BOOTSTRAP_FILE);
}
function runtimeSourcesPath() {
	return path.join(downloadsRoot(), RUNTIME_SOURCES_FILE);
}
function downloadsRoot() {
	return path.join(geelooyRoot(), "apps", "tunnel", "downloads");
}
function safeError(error) {
	return String(error?.code || error?.message || "installer_component_rebuild_failed").slice(0, 240);
}

module.exports = {
	BOOTSTRAP_FILE, COMPONENTS, PREFETCHED, RUNTIME_SOURCES_FILE,
	buildInstallerComponents, buildTar: Tar.buildTar, componentManifestPath,
	componentNames, componentSources, runtimeSourceNames, runtimeSourcesPath,
	tarHeader: Tar.tarHeader, validateRuntimeGraph
};
