#!/usr/bin/env node
// B"H
const fs = require("node:fs");
const path = require("node:path");
const Builder = require("../rebuild-manifest.cjs");
const Catalog = require("../release/runtimeCatalog.js");
const Probe = require("../release/runtimeProbe.js");
const SourcePaths = require("../release/sourcePaths.js");

/**
 * B"H — Freshness now means more than matching text. Every external dependency
 * must be named, exist at its true source root, and load through startup imports.
 */
function verify(options = {}) {
	const manifestPath = path.resolve(options.manifestPath || path.join(__dirname, "..", "manifest.txt"));
	const currentText = fs.readFileSync(manifestPath, "utf8");
	const lines = Builder.cleanLines(currentText);
	const version = lines[0];
	const expected = Builder.buildManifest({ version, repoRoot: options.repoRoot });
	if (currentText !== expected.text) return {
		ok: false,
		message: "manifest_stale",
		version,
		expectedFiles: expected.files.length
	};
	const roots = SourcePaths.resolveRoots(options.repoRoot);
	Catalog.assertManifestCoverage(expected.files, roots);
	const probe = Probe.probeRuntime(path.join(__dirname, ".."), {
		manifestPath,
		roots,
		sourceLayout: true
	});
	return probe.ok
		? { ok: true, message: "manifest_fresh", version, files: expected.files.length, probe }
		: { ok: false, message: probe.error, version, probe };
}

if (require.main === module) {
	const result = verify();
	console.log(JSON.stringify(result, null, 2));
	if (!result.ok) process.exitCode = 1;
}

module.exports = { verify };
