// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Sources = require("./zipSources.js");
const SourcePaths = require("../../../../apps/tunnel/agent/release/sourcePaths.js");
const Writer = require("./zipWriter.js");

let productionBundle = null;
let productionManifestMtimeMs = 0;

/**
 * @file Builds one verified agent ZIP while preserving canonical Git provenance.
 * @description
 * The Awtsmoos binds the manifest vessel to the exact source light that formed it.
 * Awtsmoos.com carries the Git SHA beside artifact hashes without inserting mutable
 * provenance bytes into the ZIP itself. The default production source is cached,
 * but the cache is keyed on the manifest file's mtime: whenever the manifest
 * changes on disk (Yaakov 2026-10-14 — a stale cached descriptor once served
 * 1.0.651 while manifest.txt was already 1.0.653, breaking every fresh install),
 * the bundle rebuilds automatically. A failed rebuild is never cached, so the
 * next request retries instead of serving a stale bundle forever.
 */
function productionManifestMtime() {
	try {
		return fs.statSync(
			path.join(SourcePaths.resolveRoots().agentRoot, "manifest.txt")
		).mtimeMs;
	} catch {
		return 0;
	}
}

function buildAgentBundle(repoRoot) {
	if (repoRoot) return buildFreshBundle(repoRoot);
	const mtimeMs = productionManifestMtime();
	// B"H — Yaakov 2026-10-15: Cache expires after 60 seconds.
	// The old cache keyed only on manifest.txt mtime, so source changes
	// without a manifest bump served stale bundles. Time-based expiry
	// ensures freshness while keeping the performance benefit.
	const now = Date.now();
	if (productionBundle && (now - productionBundle.builtAt) < 60000) {
		return productionBundle;
	}
	const bundle = buildFreshBundle();
	bundle.builtAt = now;
	productionBundle = bundle;
	productionManifestMtimeMs = mtimeMs;
	return bundle;
}

function buildFreshBundle(repoRoot) {
	const source = Sources.descriptor(repoRoot);
	const buffer = Writer.buildZip(source.entries);
	return {
		buffer,
		bytes: buffer.length,
		sha256: Sources.hash(buffer),
		version: source.version,
		releaseSourceSha: source.releaseSourceSha,
		manifestSha256: source.manifestSha256,
		files: source.entries.length
	};
}

function buildAgentZip(repoRoot) {
	return buildAgentBundle(repoRoot).buffer;
}

function manifestFiles(repoRoot) {
	const source = Sources.descriptor(repoRoot);
	return [source.entry, ...source.files];
}

module.exports = {
	buildAgentBundle,
	buildAgentZip,
	manifestFiles
};
