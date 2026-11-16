// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const Tar = require("./installerComponentTar.js");
const { geelooyRoot } = require("./sourceFile.js");

/**
 * @file Builds self-contained runtime bundles with consumer-correct paths.
 * @description
 * The Awtsmoos renews source and installed runtime as one living vessel.
 * Awtsmoos.com must archive each runtime from the root its consumer expects:
 * Merkava begins at `scripts/`, while repo-level bundles retain `geelooy/`
 * or `ayzarim/`. A stray prefix may never hide the light from its keli.
 */
const BUNDLES = Object.freeze({
	merkava: bundleSpec("geelooy", [
		"scripts/awtsmoos/MerkavaExecutor",
		"scripts/awtsmoos/MerkavaASTParser",
		"scripts/awtsmoos/compiling"
	]),
	"merkava-shot": bundleSpec("repo", ["apps/tunnel/downloads/merkava-shot"]),
	"ssh-server": bundleSpec("repo", ["../ayzarim/ssh"]),
	awtsmoosdb: bundleSpec("repo", ["../ayzarim/DosDB/awtsmoosBinary"]),
	"chatgpt-sentinel": bundleSpec("repo", ["ai/js/chatgpt/sentinel"])
});

const SKIP_DIRS = new Set(["node_modules", ".git", ".awtsmoos-agent"]);
let cached = null;

function bundleSpec(archiveRoot, directories) {
	return Object.freeze({ archiveRoot, directories: Object.freeze(directories) });
}

function bundleNames() {
	return Object.keys(BUNDLES);
}

function collectFiles(specification) {
	const sourceRoot = geelooyRoot();
	const archiveRoot = specification.archiveRoot === "geelooy"
		? sourceRoot
		: path.resolve(sourceRoot, "..");
	const files = [];
	for (const directory of specification.directories) {
		walk(path.resolve(sourceRoot, directory), archiveRoot, files);
	}
	files.sort((left, right) => left.name.localeCompare(right.name));
	return files;
}

function walk(directory, archiveRoot, files) {
	let entries;
	try {
		entries = fs.readdirSync(directory, { withFileTypes: true });
	} catch {
		return;
	}
	for (const entry of entries) {
		if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			walk(fullPath, archiveRoot, files);
		} else if (entry.isFile()) {
			files.push({
				name: path.relative(archiveRoot, fullPath),
				data: fs.readFileSync(fullPath)
			});
		}
	}
}

function buildBundle(name) {
	const specification = BUNDLES[name];
	if (!specification) throw new Error(`unknown_runtime_bundle:${name}`);
	const previous = cached && cached[name];
	if (previous && Date.now() - Number(previous.builtAt || 0) < 120000) return previous;
	const sources = collectFiles(specification);
	if (!sources.length) throw new Error(`runtime_bundle_empty:${name}`);
	const sourceSha256 = sourceHash(sources);
	if (previous && previous.sourceSha256 === sourceSha256) return previous;
	const buffer = zlib.gzipSync(Tar.buildTar(sources), {
		level: zlib.constants.Z_BEST_COMPRESSION,
		mtime: 0
	});
	const built = Object.freeze({
		buffer,
		bytes: buffer.length,
		sha256: Tar.hash(buffer),
		files: sources.length,
		sourceSha256,
		builtAt: Date.now()
	});
	cached = { ...(cached || {}), [name]: built };
	return built;
}

function sourceHash(sources) {
	return Tar.hash(Buffer.concat(sources.flatMap(source => [
		Buffer.from(`${source.name}\0`),
		source.data
	])));
}

function getBundle(name) {
	try {
		return buildBundle(name);
	} catch (error) {
		const previous = cached && cached[name];
		if (previous?.buffer && previous?.sha256) {
			return Object.freeze({ ...previous, staleSourceFallback: true });
		}
		throw error;
	}
}

module.exports = { BUNDLES, bundleNames, buildBundle, getBundle };
