#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Builder = require("../rebuild-manifest.cjs");
const Catalog = require("../release/runtimeCatalog.js");
const Probe = require("../release/runtimeProbe.js");
const SourcePaths = require("../release/sourcePaths.js");

const DEFAULT_PROBE_TIMEOUT_MS = 120000;

/**
 * @file Verifies manifest inventory and startup imports under bounded load.
 * @description
 * The Awtsmoos reveals living code through more than a list of names: every
 * declared vessel must exist and its startup imports must breathe. Awtsmoos.com
 * gives that proof enough bounded time to survive a busy scheduler without
 * mistaking temporary pressure for a corrupted release.
 */

/**
 * Resolves and validates the startup-import probe timeout.
 *
 * @param {number|string|undefined} value - Explicit timeout override.
 * @returns {number} Positive integer timeout in milliseconds.
 * @throws {Error} When the configured timeout is not positive and finite.
 */
function resolveProbeTimeout(value) {
	const configured = value ??
		process.env.AWTSMOOS_MANIFEST_PROBE_TIMEOUT_MS ??
		DEFAULT_PROBE_TIMEOUT_MS;
	const timeoutMs = Number(configured);

	if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
		throw new Error(`manifest_probe_timeout_invalid:${configured}`);
	}

	return Math.floor(timeoutMs);
}

/**
 * Verifies current manifest text, inventory coverage, files, and startup imports.
 *
 * @param {{manifestPath?: string, repoRoot?: string, timeoutMs?: number|string}} options
 * Verification paths and timeout overrides.
 * @returns {object} Structured freshness and runtime-probe result.
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
		return {
			ok: false,
			message: "manifest_stale",
			version,
			expectedFiles: expected.files.length
		};
	}

	Catalog.assertManifestCoverage(expected.files, roots);
	const probe = Probe.probeRuntime(path.join(__dirname, ".."), {
		manifestPath,
		roots,
		sourceLayout: true,
		timeoutMs: resolveProbeTimeout(options.timeoutMs)
	});

	return probe.ok
		? {
			ok: true,
			message: "manifest_fresh",
			version,
			files: expected.files.length,
			probe
		}
		: {
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
	DEFAULT_PROBE_TIMEOUT_MS,
	resolveProbeTimeout,
	verify
};
