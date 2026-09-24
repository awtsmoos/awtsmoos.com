// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Document = require("./manifestDocument.js");

/**
 * @file Builds the agent's build provenance block.
 * @description
 * AGENT_VERSION is generated from manifest/build metadata instead of being
 * hardcoded: manifestVersion comes from manifest.txt line one, releaseSourceSha
 * from the environment or the release-source-sha.txt marker written at build
 * time, and manifestSha256 hashes the manifest itself. Anything that needs to
 * state what build it runs reads this block through lib/build-info.js.
 */

const DEFAULT_AGENT_ROOT = path.join(__dirname, "..");

/** First clean line of manifest.txt; the manifest's own version stamp. */
function manifestVersion(manifestPath) {
	try {
		const lines = Document.cleanLines(fs.readFileSync(manifestPath, "utf8"));
		return String(lines[0] || "").trim() || "0.0.0";
	} catch {
		return "0.0.0";
	}
}

/** Build source SHA: explicit env wins, then the build-time marker file. */
function releaseSourceSha(agentRoot) {
	const env = String(process.env.AWTSMOOS_RELEASE_SOURCE_SHA || "").trim();
	if (env) return env;
	for (const candidate of [
		path.join(agentRoot, "release-source-sha.txt"),
		path.join(agentRoot, "..", "release-source-sha.txt"),
		path.join(agentRoot, "..", "..", "release-source-sha.txt")
	]) {
		try {
			const value = String(fs.readFileSync(candidate, "utf8")).trim();
			if (value) return value;
		} catch {
			// Marker not written for this build; keep looking outward.
		}
	}
	return "unknown";
}

function sha256File(filePath) {
	try {
		return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
	} catch {
		return "";
	}
}

/**
 * Computes the full build provenance block for one agent root.
 * @param {object} [options] {agentRoot, manifestPath}
 * @returns {object} {agentVersion, manifestVersion, releaseSourceSha, manifestSha256, builtAt, nodeVersion}
 */
function buildInfo(options = {}) {
	const agentRoot = path.resolve(options.agentRoot || DEFAULT_AGENT_ROOT);
	const manifestPath = options.manifestPath || path.join(agentRoot, "manifest.txt");
	const version = manifestVersion(manifestPath);
	return {
		agentVersion: `split-agent-${version}`,
		manifestVersion: version,
		releaseSourceSha: releaseSourceSha(agentRoot),
		manifestSha256: sha256File(manifestPath),
		builtAt: new Date().toISOString(),
		nodeVersion: process.version
	};
}

module.exports = {
	buildInfo,
	manifestVersion,
	releaseSourceSha,
	sha256File
};
