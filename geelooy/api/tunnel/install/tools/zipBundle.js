// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");
const Sources = require("./zipSources.js");
const SourcePaths = require("../../../../apps/tunnel/agent/release/sourcePaths.js");
const Writer = require("./zipWriter.js");

let productionBundle = null;
let productionManifestMtimeMs = 0;
const DEFAULT_CACHE_DIR = "/var/cache/awtsmoos-tunnel-bundle";
const HEX64 = /^[0-9a-f]{64}$/;
function cacheDir() { return process.env.AWTSMOOS_TUNNEL_BUNDLE_CACHE_DIR || DEFAULT_CACHE_DIR; }
function sha(value) { return crypto.createHash("sha256").update(value).digest("hex"); }

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
	if (productionBundle && productionManifestMtimeMs === mtimeMs) {
		return productionBundle;
	}
	// B"H — canonical deployment seals ZIP bytes before touching the running
	// service. Serving the verified prebuilt artifact avoids a multi-second
	// synchronous release probe in the live WebSocket server process.
	const cached = readVerifiedCache();
	if (cached) {
		productionBundle = cached;
		productionManifestMtimeMs = mtimeMs;
		return cached;
	}
	const bundle = buildFreshBundle();
	bundle.builtAt = now;
	productionBundle = bundle;
	productionManifestMtimeMs = mtimeMs;
	return bundle;
}

function readVerifiedCache(directory = cacheDir()) {
	try {
		const meta = JSON.parse(fs.readFileSync(path.join(directory, "agent.json"), "utf8"));
		const source = SourcePaths.resolveRoots();
		const manifestBytes = fs.readFileSync(path.join(source.agentRoot, "manifest.txt"));
		if (!HEX64.test(meta.sha256) || meta.manifestSha256 !== sha(manifestBytes)) return null;
		const buffer = fs.readFileSync(path.join(directory, "agent.zip"));
		if (buffer.length !== meta.bytes || sha(buffer) !== meta.sha256) return null;
		if (!Number.isInteger(meta.files) || meta.files < 1000 || !/^\d+\.\d+\.\d+$/.test(meta.version)) return null;
		return { ...meta, buffer, builtAt: Date.now(), prebuiltVerified: true };
	} catch { return null; }
}

function writeVerifiedCache(bundle, directory = cacheDir()) {
	if (!bundle?.buffer || !HEX64.test(bundle.sha256) || sha(bundle.buffer) !== bundle.sha256) {
		throw Error("invalid_prebuilt_tunnel_bundle");
	}
	fs.mkdirSync(directory, { recursive: true, mode: 0o755 });
	const stamp = `${process.pid}-${Date.now()}`;
	const artifact = path.join(directory, "agent.zip");
	const metadata = path.join(directory, "agent.json");
	const zipTemp = `${artifact}.${stamp}.tmp`;
	const metaTemp = `${metadata}.${stamp}.tmp`;
	try {
		fs.writeFileSync(zipTemp, bundle.buffer, { mode: 0o644, flag: "wx" });
		fs.renameSync(zipTemp, artifact);
		const { buffer, ...fields } = bundle;
		fs.writeFileSync(metaTemp, `${JSON.stringify(fields)}\n`, { mode: 0o644, flag: "wx" });
		fs.renameSync(metaTemp, metadata);
	} finally {
		for (const file of [zipTemp, metaTemp]) { try { fs.unlinkSync(file); } catch {} }
	}
	return true;
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
	readVerifiedCache,
	writeVerifiedCache,
	buildAgentZip,
	manifestFiles
};
