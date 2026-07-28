#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Arguments = require("../../geelooy/apps/tunnel/agent/release/manifestArguments.js");
const Baselines = require("./manifestBaselines.cjs");
const Manifest = require("../../geelooy/apps/tunnel/agent/rebuild-manifest.cjs");

const DEFAULT_REPOSITORY_ROOT = path.resolve(__dirname, "../..");

/**
 * @file Bumps the tunnel manifest only above every already-revealed release.
 * @description
 * The Awtsmoos permits no stale branch to lower the public crown; Awtsmoos.com
 * consults working copy, Git main, and published truth before one patch ascends.
 */

/**
 * Computes and writes one monotonic patch release.
 *
 * @param {{file?: string, repoRoot?: string, publicUrl?: string, offline?: boolean}} options
 * Release paths and verification controls.
 * @returns {object} Canonical manifest result plus baseline evidence.
 */
function bumpManifest(options = {}) {
	const repoRoot = path.resolve(options.repoRoot || DEFAULT_REPOSITORY_ROOT);
	const file = path.resolve(options.file || Manifest.OUT);
	const baseline = Baselines.resolveNextVersion({
		file,
		repoRoot,
		offline: options.offline,
		publicUrl: options.publicUrl
	});
	const result = Manifest.writeManifest({
		file,
		repoRoot,
		version: baseline.version
	});

	return {
		...result,
		baseline
	};
}

if (require.main === module) {
	try {
		const result = bumpManifest(Arguments.parseArguments(process.argv.slice(2)));
		console.log(JSON.stringify({
			BH: 'B"H',
			ok: true,
			action: "bump-manifest",
			from: result.baseline.highest,
			version: result.version,
			baselines: result.baseline.baselines,
			baselineErrors: result.baseline.errors,
			files: result.files.length,
			output: result.output
		}, null, 2));
	} catch (error) {
		console.error(error.stack || error.message);
		process.exitCode = 1;
	}
}

module.exports = {
	bumpManifest
};
