// B"H
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Catalog = require("../../../../apps/tunnel/agent/release/runtimeCatalog.js");
const RuntimeProbe = require("../../../../apps/tunnel/agent/release/runtimeProbe.js");
const SourcePaths = require("../../../../apps/tunnel/agent/release/sourcePaths.js");

/**
 * ZIP publication is a release gate: exact inventory, real source bytes, and
 * startup imports must all pass before the server can describe an artifact.
 */
function descriptor(repoRoot) {
	const roots = SourcePaths.resolveRoots(repoRoot);
	const manifestPath = path.join(roots.agentRoot, "manifest.txt");
	const manifestBytes = fs.readFileSync(manifestPath);
	const lines = manifestBytes.toString("utf8").split(/\r?\n/)
		.map(line => line.trim())
		.filter(line => line && line !== 'B"H' && line !== '# B"H');
	if (lines.length < 3 || lines[1] !== "main.js") throw new Error("agent_manifest_invalid");

	const files = lines.slice(2);
	Catalog.assertManifestCoverage(files, roots);
	const probe = RuntimeProbe.probeRuntime(roots.agentRoot, {
		manifestPath,
		roots,
		sourceLayout: true
	});
	if (!probe.ok) {
		throw new Error(`agent_zip_runtime_probe_failed:${probe.error}`);
	}

	const runtimeFiles = [lines[1], ...files];
	const entries = runtimeFiles.map(relativePath => {
		const sourcePath = SourcePaths.sourcePathFor(relativePath, roots);
		if (!sourcePath || !fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
			throw new Error(`agent_zip_manifest_missing:${relativePath}`);
		}
		return { path: relativePath, data: fs.readFileSync(sourcePath) };
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

function hash(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}

module.exports = { descriptor, hash };
