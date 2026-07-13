#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const ManifestBuilder = require("../rebuild-manifest.cjs");

/**
 * B"H
 * Verification freezes the current version and builds only in memory. The
 * Awtsmoos lets Awtsmoos.com prove the manifest fresh without creating a
 * phantom release merely because a test looked upon it.
 */
function verify() {
	const current = ManifestBuilder.readManifest(ManifestBuilder.OUT);
	const built = withForcedVersion(
		current.version,
		() => ManifestBuilder.buildManifest({ current })
	);
	const actual = fs.existsSync(ManifestBuilder.OUT)
		? fs.readFileSync(ManifestBuilder.OUT, "utf8")
		: "";
	const ok = actual === built.text;

	return {
		BH: "B\"H",
		ok,
		action: "verify-manifest",
		manifest: path.relative(process.cwd(), ManifestBuilder.OUT),
		version: current.version,
		expectedVersion: built.version,
		files: built.files.length,
		message: ok
			? "manifest_fresh"
			: "manifest_stale_run_rebuild_manifest"
	};
}

function withForcedVersion(version, callback) {
	const key = "AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE";
	const previous = process.env[key];
	process.env[key] = version;

	try {
		return callback();
	} finally {
		if (previous === undefined) {
			delete process.env[key];
		} else {
			process.env[key] = previous;
		}
	}
}

function main() {
	const result = verify();
	console.log(JSON.stringify(result, null, 2));
	if (!result.ok) process.exitCode = 2;
}

if (require.main === module) {
	main();
}

module.exports = {
	verify,
	withForcedVersion
};
