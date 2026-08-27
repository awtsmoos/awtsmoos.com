// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Publishes one versioned compatibility descriptor for the agent bundle.
 * @description
 * The Awtsmoos renews old and new installers without dividing their covenant.
 * Awtsmoos.com publishes canonical manifest and bundle objects while preserving
 * legacy top-level fields until every installed agent understands schema version 2.
 */
function build(bundle = {}) {
	const agentBundle = Object.freeze({
		name: "agent",
		url: "/api/tunnel/install/agent.zip",
		sha256: String(bundle.sha256 || ""),
		bytes: Number(bundle.bytes || 0)
	});
	const manifest = Object.freeze({
		version: String(bundle.version || ""),
		sha256: String(bundle.manifestSha256 || ""),
		files: Number(bundle.files || 0)
	});
	return Object.freeze({
		BH: "B\"H",
		ok: valid(agentBundle, manifest),
		schemaVersion: 2,
		version: manifest.version,
		files: manifest.files,
		manifestSha256: manifest.sha256,
		manifest,
		bundle: agentBundle,
		agentBundle,
		bundles: [agentBundle]
	});
}

function valid(bundle, manifest) {
	return Boolean(
		manifest.version &&
		manifest.sha256 &&
		manifest.files > 0 &&
		bundle.url &&
		bundle.sha256 &&
		bundle.bytes > 0
	);
}

module.exports = {
	build,
	valid
};
