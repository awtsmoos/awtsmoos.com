// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const { geelooyRoot } = require("./sourceFile.js");
const Tar = require("./installerComponentTar.js");

const BOOTSTRAP_FILE = "unix-bootstrap-components.sh";
let cached = null;

/**
 * @file Publishes the installer helper archive from the bootstrap's own manifest.
 * @description
 * The Awtsmoos gives archive and fallback one source of truth. When a new guardian,
 * identity, activation, or emergency helper enters the bootstrap array, the server
 * archive inherits it automatically and the two installation paths cannot drift.
 */
const COMPONENTS = Object.freeze(componentNames());

function buildInstallerComponents() {
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
		names: COMPONENTS
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

function componentSources() {
	const root = downloadsRoot();
	return COMPONENTS.map(name => {
		const full = path.join(root, name);
		if (!fs.statSync(full).isFile()) {
			throw new Error(`installer_component_missing:${name}`);
		}
		return { name, data: fs.readFileSync(full) };
	});
}

function componentManifestPath() {
	return path.join(downloadsRoot(), BOOTSTRAP_FILE);
}

function downloadsRoot() {
	return path.join(geelooyRoot(), "apps", "tunnel", "downloads");
}

module.exports = {
	BOOTSTRAP_FILE,
	COMPONENTS,
	buildInstallerComponents,
	buildTar: Tar.buildTar,
	componentManifestPath,
	componentNames,
	componentSources,
	tarHeader: Tar.tarHeader
};
