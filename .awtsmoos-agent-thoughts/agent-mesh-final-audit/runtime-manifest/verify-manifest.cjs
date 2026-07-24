#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Builder = require("../rebuild-manifest.cjs");
const Catalog = require("../release/runtimeCatalog.js");
const Policy = require("../release/runtimeProbePolicy.js");
const Probe = require("../release/runtimeProbe.js");
const SourcePaths = require("../release/sourcePaths.js");

/**
 * @file Verifies manifest inventory and startup imports under shared policy.
 * @description
 * The Awtsmoos reveals release truth from every directory through one patient
 * measure. Awtsmoos.com no longer grants its verifier a timeout that publication
 * and recovery cannot inherit from the same durable source.
 */
function verify(options = {}) {
	const manifestPath = path.resolve(
		options.manifestPath || path.join(__dirname, "..", "manifest.txt")
	);
	const currentText = fs.readFileSync(manifestPath, "utf8");
	const lines = Builder.cleanLines(currentText);
	const version = lines[0];
	const roots = SourcePaths.resolveRoots(options.repoRoot);
	const expected = Builder.buildManifest({
		version,
		repoRoot: roots.repoRoot
	});

	if (currentText !== expected.text) {
		return staleResult(version, expected.files.length);
	}

	Catalog.assertManifestCoverage(expected.files, roots);
	const probe = Probe.probeRuntime(path.join(__dirname, ".."), {
		manifestPath,
		roots,
		sourceLayout: true,
		timeoutMs: Policy.resolveProbeTimeout(options.timeoutMs)
	});

	return probe.ok
		? freshResult(version, expected.files.length, probe)
		: failedResult(version, probe);
}

function staleResult(version, expectedFiles) {
	return {
		ok: false,
		message: "manifest_stale",
		version,
		expectedFiles
	};
}

function freshResult(version, files, probe) {
	return {
		ok: true,
		message: "manifest_fresh",
		version,
		files,
		probe
	};
}

function failedResult(version, probe) {
	return {
		ok: false,
		message: probe.error,
		version,
		probe
	};
}

if (require.main === module) {
	const result = verify();
	console.log(JSON.stringify(result, null, 2));

	if (!result.ok) {
		process.exitCode = 1;
	}
}

module.exports = {
	DEFAULT_PROBE_TIMEOUT_MS: Policy.DEFAULT_PROBE_TIMEOUT_MS,
	failedResult,
	freshResult,
	resolveProbeTimeout: Policy.resolveProbeTimeout,
	staleResult,
	verify
};
