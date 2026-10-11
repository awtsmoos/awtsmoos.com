// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const Tar = require("./installerComponentTar.js");
const { geelooyRoot } = require("./sourceFile.js");

/**
 * @file Self-contained runtime bundles for installed tunnels (Yaakov 2026-10-11 hard rule).
 * @description
 * ABSOLUTELY NOTHING in the installed tunnel may depend on the mw-repo being
 * present on the host. These tarballs carry every out-of-agent runtime module
 * the agent needs (Merkava, SSH server, AwtsmoosDB, chatgpt sentinel) with
 * repo-relative paths preserved, so the installed agent resolves them from its
 * own install root instead of ../../../../.. escapes into a missing repo.
 *
 * Built on demand from the repo with the same stale-cache discipline as the
 * installer components: rebuild when source changes, else serve the verified
 * cached bundle.
 */

const BUNDLES = Object.freeze({
	// name: [repo-relative source dirs] (geelooyRoot() = <repo>/geelooy)
	"merkava": [
		"scripts/awtsmoos/MerkavaExecutor",
		"scripts/awtsmoos/MerkavaASTParser",
		"scripts/awtsmoos/compiling",
	],
	"ssh-server": ["../ayzarim/ssh"],
	"awtsmoosdb": ["../ayzarim/DosDB/awtsmoosBinary"],
	"chatgpt-sentinel": ["ai/js/chatgpt/sentinel"],
});

const SKIP_DIRS = new Set(["node_modules", ".git", ".awtsmoos-agent"]);

let cached = null; // { [name]: { buffer, bytes, sha256, files, sourceSha256 } }

function bundleNames() {
	return Object.keys(BUNDLES);
}

function collectFiles(dirs) {
	const root = geelooyRoot();
	const files = [];
	for (const dir of dirs) {
		const abs = path.resolve(root, dir);
		walk(abs, root, files);
	}
	// Deterministic order for a stable hash.
	files.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
	return files;
}

function walk(abs, root, files) {
	let entries;
	try {
		entries = fs.readdirSync(abs, { withFileTypes: true });
	} catch {
		return;
	}
	for (const entry of entries) {
		if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
		const full = path.join(abs, entry.name);
		if (entry.isDirectory()) {
			walk(full, root, files);
		} else if (entry.isFile()) {
			// Repo-relative name, e.g. scripts/awtsmoos/MerkavaExecutor/... or ayzarim/ssh/...
			const repoRoot = path.resolve(root, "..");
			files.push({ name: path.relative(repoRoot, full), data: fs.readFileSync(full) });
		}
	}
}

function buildBundle(name) {
	const dirs = BUNDLES[name];
	if (!dirs) throw new Error(`unknown_runtime_bundle:${name}`);
	const sources = collectFiles(dirs);
	if (!sources.length) throw new Error(`runtime_bundle_empty:${name}`);
	const sourceSha256 = Tar.hash(Buffer.concat(sources.flatMap(s => [
		Buffer.from(`${s.name}\0`),
		s.data,
	])));
	const prior = cached && cached[name];
	if (prior && prior.sourceSha256 === sourceSha256) return prior;
	const buffer = zlib.gzipSync(Tar.buildTar(sources), {
		level: zlib.constants.Z_BEST_COMPRESSION,
		mtime: 0,
	});
	const built = Object.freeze({
		buffer,
		bytes: buffer.length,
		sha256: Tar.hash(buffer),
		files: sources.length,
		sourceSha256,
	});
	cached = { ...(cached || {}), [name]: built };
	return built;
}

function getBundle(name) {
	try {
		return buildBundle(name);
	} catch (error) {
		const prior = cached && cached[name];
		if (prior && prior.buffer && prior.sha256) {
			return Object.freeze({ ...prior, staleSourceFallback: true });
		}
		throw error;
	}
}

module.exports = { BUNDLES, bundleNames, buildBundle, getBundle };
