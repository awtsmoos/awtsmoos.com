// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Reads the build-time provenance block generated into release/buildInfo.json.
 * @description
 * The manifest rebuild writes buildInfo.json; at runtime every consumer reads it
 * through this cached loader. When the file is absent (a tree that was never
 * rebuilt) the agent reports the legacy constant so version claims never lie
 * about being generated when they were not.
 */

const FALLBACK_VERSION = "split-agent-2.0.0";
const CACHE_TTL_MS = 60 * 1000;

let cached = null;
let cachedAt = 0;

function infoPath() {
	return path.join(__dirname, "..", "release", "buildInfo.json");
}

/** Parsed buildInfo.json, or null when the tree was never rebuilt. */
function load(options = {}) {
	const now = Date.now();
	if (cached && !options.refresh && now - cachedAt < CACHE_TTL_MS) return cached;
	try {
		cached = JSON.parse(fs.readFileSync(infoPath(), "utf8"));
	} catch {
		cached = null;
	}
	cachedAt = now;
	return cached;
}

/** Generated agent version, or the legacy constant when no build info exists. */
function agentVersion() {
	const info = load() || {};
	const version = info.agentVersion;
	return typeof version === "string" && version.trim() ? version.trim() : FALLBACK_VERSION;
}

/** Full provenance block for diagnostics, events, and bundles. */
function provenance() {
	const info = load() || {};
	const generated = typeof info.agentVersion === "string" && info.agentVersion.trim() !== "";
	return {
		agentVersion: agentVersion(),
		manifestVersion: typeof info.manifestVersion === "string" ? info.manifestVersion : "",
		releaseSourceSha: typeof info.releaseSourceSha === "string" ? info.releaseSourceSha : "unknown",
		manifestSha256: typeof info.manifestSha256 === "string" ? info.manifestSha256 : "",
		builtAt: typeof info.builtAt === "string" ? info.builtAt : "",
		nodeVersion: typeof info.nodeVersion === "string" ? info.nodeVersion : process.version,
		buildInfoAvailable: generated
	};
}

module.exports = {
	FALLBACK_VERSION,
	agentVersion,
	load,
	provenance
};
