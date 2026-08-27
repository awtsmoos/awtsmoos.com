// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Catalog = require("../../../../apps/tunnel/agent/release/runtimeCatalog.js");
const RuntimeProbe = require("../../../../apps/tunnel/agent/release/runtimeProbe.js");
const SourcePaths = require("../../../../apps/tunnel/agent/release/sourcePaths.js");

/**
 * @file Resolves exact ZIP sources only after release runtime proof succeeds.
 * @description
 * The Awtsmoos binds manifest names, source bytes, startup testimony, and hashes
 * into one publication vessel. Awtsmoos.com now preserves the probe's timing and
 * signal evidence whenever that vessel cannot be revealed safely.
 */
function descriptor(repoRoot) {
	const roots = SourcePaths.resolveRoots(repoRoot);
	const manifestPath = path.join(roots.agentRoot, "manifest.txt");
	const manifestBytes = fs.readFileSync(manifestPath);
	const lines = manifestLines(manifestBytes);

	if (lines.length < 3 || lines[1] !== "main.js") {
		throw new Error("agent_manifest_invalid");
	}

	const files = lines.slice(2);
	Catalog.assertManifestCoverage(files, roots);
	const probe = RuntimeProbe.probeRuntime(roots.agentRoot, {
		manifestPath,
		roots,
		sourceLayout: true
	});
	assertProbe(probe);

	const runtimeFiles = [lines[1], ...files];
	const entries = runtimeFiles.map((relativePath) => {
		return entryFor(relativePath, roots);
	});

	return {
		version: lines[0],
		entry: lines[1],
		files,
		entries,
		probe,
		manifestSha256: hash(manifestBytes)
	};
}

function manifestLines(manifestBytes) {
	return manifestBytes.toString("utf8").split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => line && line !== 'B"H' && line !== '# B"H');
}

function entryFor(relativePath, roots) {
	const sourcePath = SourcePaths.sourcePathFor(relativePath, roots);

	if (!sourcePath || !fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
		throw new Error(`agent_zip_manifest_missing:${relativePath}`);
	}

	return {
		path: relativePath,
		data: fs.readFileSync(sourcePath)
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

	throw new Error(
		`agent_zip_runtime_probe_failed:${JSON.stringify(details)}`
	);
}

function hash(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}

module.exports = {
	assertProbe,
	descriptor,
	entryFor,
	hash,
	manifestLines
};
