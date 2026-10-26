// B"H
// Boruch Hashem
// Blessed is He

"use strict";

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
const HEX40 = /^[0-9a-f]{40}$/;

/** Return the protected directory containing a published release artifact. */
function cacheDir() {
	return process.env.AWTSMOOS_TUNNEL_BUNDLE_CACHE_DIR || DEFAULT_CACHE_DIR;
}

/** Compute the SHA-256 digest of exact file bytes. */
function sha(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}

/** Observe manifest changes without scanning or rebuilding a ZIP. */
function productionManifestMtime() {
	try {
		return fs.statSync(path.join(
			SourcePaths.resolveRoots().agentRoot, "manifest.txt"
		)).mtimeMs;
	} catch {
		return 0;
	}
}

/**
 * Resolve immutable release bytes.
 * Explicit repoRoot is an offline build request for a release preflight.
 * Production HTTP requests NEVER rebuild the runtime on the event loop;
 * doing so can stall every website request and WebSocket consumer.
 */
function buildAgentBundle(repoRoot) {
	if (repoRoot) return buildFreshBundle(repoRoot);
	const manifestMtimeMs = productionManifestMtime();
	if (productionBundle && productionManifestMtimeMs === manifestMtimeMs) {
		return productionBundle;
	}
	const cached = readVerifiedCache();
	if (cached) {
		productionBundle = cached;
		productionManifestMtimeMs = manifestMtimeMs;
		return cached;
	}
	if (process.env.NODE_ENV === "production") {
		const error = new Error("tunnel_prebuilt_bundle_missing_or_invalid");
		error.code = "tunnel_prebuilt_bundle_missing_or_invalid";
		throw error;
	}
	// Only developer tools may build implicitly, never the live HTTP server.
	const bundle = buildFreshBundle();
	productionBundle = bundle;
	productionManifestMtimeMs = manifestMtimeMs;
	return bundle;
}

/** Load only an exact, hash-verified, manifest-matching artifact. */
function readVerifiedCache(directory = cacheDir()) {
	try {
		const meta = JSON.parse(fs.readFileSync(path.join(directory, "agent.json"), "utf8"));
		const roots = SourcePaths.resolveRoots();
		const manifest = fs.readFileSync(path.join(roots.agentRoot, "manifest.txt"));
		if (!HEX64.test(meta.sha256) || meta.manifestSha256 !== sha(manifest)) {
			return null;
		}
		if (!HEX40.test(String(meta.releaseSourceSha || ""))) return null;
		// A verified ZIP from a previous canonical commit is not this release.
		const expectedSource = String(process.env.AWTSMOOS_RELEASE_SOURCE_SHA || "").trim().toLowerCase();
		if (expectedSource && (!HEX40.test(expectedSource) || meta.releaseSourceSha !== expectedSource)) return null;
		const buffer = fs.readFileSync(path.join(directory, "agent.zip"));
		if (buffer.length !== meta.bytes || sha(buffer) !== meta.sha256) return null;
		if (!Number.isInteger(meta.files) || meta.files < 1000) return null;
		if (!/^\d+\.\d+\.\d+$/.test(meta.version)) return null;
		return { ...meta, buffer, builtAt: Date.now(), prebuiltVerified: true };
	} catch {
		return null;
	}
}

/**
 * Atomically publish sealed release bytes for the independent HTTP server.
 * The canonical release preflight invokes this before service activation.
 */
function writeVerifiedCache(bundle, directory = cacheDir()) {
	if (!bundle?.buffer || !HEX64.test(bundle.sha256) ||
		sha(bundle.buffer) !== bundle.sha256) {
		throw Error("invalid_prebuilt_tunnel_bundle");
	}
	fs.mkdirSync(directory, { recursive: true, mode: 0o755 });
	const stamp = `${process.pid}-${Date.now()}`;
	const zipPath = path.join(directory, "agent.zip");
	const metadataPath = path.join(directory, "agent.json");
	const zipTemp = `${zipPath}.${stamp}.tmp`;
	const metaTemp = `${metadataPath}.${stamp}.tmp`;
	try {
		fs.writeFileSync(zipTemp, bundle.buffer, { mode: 0o644, flag: "wx" });
		fs.renameSync(zipTemp, zipPath);
		const { buffer, ...fields } = bundle;
		fs.writeFileSync(metaTemp, `${JSON.stringify(fields)}\n`, {
			mode: 0o644,
			flag: "wx"
		});
		fs.renameSync(metaTemp, metadataPath);
	} finally {
		for (const file of [zipTemp, metaTemp]) {
			try { fs.unlinkSync(file); } catch {}
		}
	}
	return true;
}

/** Build an explicit offline artifact after full manifest and startup probes. */
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
