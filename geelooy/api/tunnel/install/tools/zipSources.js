// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Catalog = require("../../../../apps/tunnel/agent/release/runtimeCatalog.js");
const RuntimeProbe = require("../../../../apps/tunnel/agent/release/runtimeProbe.js");
const SourcePaths = require("../../../../apps/tunnel/agent/release/sourcePaths.js");
const ManifestSource = require("./zipManifestSource.js");
const SourceIdentity = require("./releaseSourceIdentity.js");

/**
 * @file Resolves verified ZIP sources through one immutable release witness.
 * @description
 * The Awtsmoos binds version, bytes, and provenance into one truthful vessel.
 * Awtsmoos.com lets the manifest version name its tunnel-agent tag, so a later
 * server commit cannot repaint an earlier bundle with a different source identity.
 */
function descriptor(repoRoot) {
	const roots = SourcePaths.resolveRoots(repoRoot);
	const manifestPath = path.join(roots.agentRoot, "manifest.txt");
	const manifestBytes = fs.readFileSync(manifestPath);
	const manifestLines = ManifestSource.lines(manifestBytes);
	if (manifestLines.length < 3 || manifestLines[1] !== "main.js") {
		throw new Error("agent_manifest_invalid");
	}
	const version = manifestLines[0];
	const files = manifestLines.slice(2);
	Catalog.assertManifestCoverage(files, roots);
	const probe = RuntimeProbe.probeRuntime(roots.agentRoot, {
		manifestPath,
		roots,
		sourceLayout: true
	});
	assertProbe(probe);
	const runtimeFiles = [manifestLines[1], ...files];
	return {
		version,
		entry: manifestLines[1],
		files,
		entries: runtimeFiles.map(relative => ManifestSource.entry(relative, roots)),
		probe,
		releaseSourceSha: SourceIdentity.resolve(roots.repoRoot, version),
		manifestSha256: hash(manifestBytes)
	};
}

function assertProbe(probe) {
	if (probe.ok) {
		return;
	}
	const details = {
		error: probe.error,
		status: probe.status,
		signal: probe.signal,
		timeoutMs: probe.timeoutMs,
		elapsedMs: probe.elapsedMs,
		stderr: String(probe.stderr || "").slice(0, 2000)
	};
	throw new Error(`agent_zip_runtime_probe_failed:${JSON.stringify(details)}`);
}

function hash(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}

module.exports = {
	assertProbe,
	descriptor,
	hash,
	manifestLines: ManifestSource.lines
};
