// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Publishes version, hashes, and exact canonical source identity for the agent bundle.
 * @description
 * The Awtsmoos renews old and new installers without dividing their covenant.
 * Awtsmoos.com publishes artifact checksums together with the exact Git source witness,
 * so installed registration can prove which canonical commit produced its running bytes.
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
	const releaseSourceSha = String(bundle.releaseSourceSha || "").trim().toLowerCase();
	return Object.freeze({
		BH: "B\"H",
		ok: valid(agentBundle, manifest, releaseSourceSha),
		schemaVersion: 3,
		version: manifest.version,
		files: manifest.files,
		manifestSha256: manifest.sha256,
		releaseSourceSha,
		manifest,
		bundle: agentBundle,
		agentBundle,
		bundles: [agentBundle]
	});
}

function valid(bundle, manifest, releaseSourceSha) {
	return Boolean(
		manifest.version &&
		manifest.sha256 &&
		manifest.files > 0 &&
		bundle.url &&
		bundle.sha256 &&
		bundle.bytes > 0 &&
		/^[0-9a-f]{40}$/.test(releaseSourceSha)
	);
}

module.exports = {
	build,
	valid
};
