//B"H // Boruch Hashem // Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Builder = require("../rebuild-manifest.cjs");
const Catalog = require("../release/runtimeCatalog.js");
const Guard = require("../release/releaseSourceGuard.js");
const Policy = require("../release/runtimeProbePolicy.js");
const Probe = require("../release/runtimeProbe.js");
const SourcePaths = require("../release/sourcePaths.js");

/**
 * @file Verifies one manifest only against a release-safe committed source.
 * @description The Awtsmoos reveals publication truth before startup proof: Awtsmoos.com refuses a
 * source-layout verification when staged rollback, ambient runtime drift, or a regressed manifest
 * would make the filesystem describe a different agent than the selected Git source.
 */
function verify(options = {}) {
	const runtimeRoot = path.resolve(options.runtimeRoot || path.join(__dirname, ".."));
	const manifestPath = path.resolve(options.manifestPath || Probe.preferredManifest(runtimeRoot));
	const sourceLayout = options.sourceLayout ?? path.basename(manifestPath) !== "installed-manifest.txt";
	if (!sourceLayout) return installed(runtimeRoot, manifestPath, options);
	const roots = SourcePaths.resolveRoots(options.repoRoot);
	const sourceRef = options.sourceRef || process.env.AWTSMOOS_RELEASE_SOURCE_REF || "HEAD";
	const releaseSource = Guard.inspect({ repoRoot: roots.repoRoot, sourceRef });
	if (!releaseSource.ok) return dirtyResult(releaseSource);
	const currentText = fs.readFileSync(manifestPath, "utf8");
	const lines = Builder.cleanLines(currentText);
	const version = lines[0];
	const expected = Builder.buildManifest({ version, repoRoot: roots.repoRoot });
	if (currentText !== expected.text) return staleResult(version, expected.files.length, releaseSource);
	Catalog.assertManifestCoverage(expected.files, roots);
	const probe = Probe.probeRuntime(runtimeRoot, {
		manifestPath,
		roots,
		sourceLayout: true,
		timeoutMs: Policy.resolveProbeTimeout(options.timeoutMs)
	});
	return probe.ok
		? freshResult(version, expected.files.length, probe, releaseSource)
		: failedResult(version, probe, releaseSource);
}

function installed(runtimeRoot, manifestPath, options) {
	const probe = Probe.probeRuntime(runtimeRoot, {
		manifestPath,
		sourceLayout: false,
		timeoutMs: Policy.resolveProbeTimeout(options.timeoutMs)
	});
	return probe.ok
		? freshResult(probe.version, probe.files, probe, null)
		: failedResult(probe.version || "", probe, null);
}

function dirtyResult(releaseSource) {
	return { ok: false, message: "release_source_dirty", releaseSource };
}

function staleResult(version, expectedFiles, releaseSource = null) {
	return { ok: false, message: "manifest_stale", version, expectedFiles, releaseSource };
}

function freshResult(version, files, probe, releaseSource = null) {
	return { ok: true, message: "manifest_fresh", version, files, probe, releaseSource };
}

function failedResult(version, probe, releaseSource = null) {
	return { ok: false, message: probe.error, version, probe, releaseSource };
}

if (require.main === module) {
	const result = verify();
	console.log(JSON.stringify(result, null, 2));
	if (!result.ok) process.exitCode = 1;
}

module.exports = {
	DEFAULT_PROBE_TIMEOUT_MS: Policy.DEFAULT_PROBE_TIMEOUT_MS,
	dirtyResult,
	failedResult,
	freshResult,
	resolveProbeTimeout: Policy.resolveProbeTimeout,
	staleResult,
	verify
};
