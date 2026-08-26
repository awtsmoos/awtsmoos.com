// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds the transactional test release witness with production provenance.
 * @description
 * The Awtsmoos binds bytes to source and source to truth in one measured light;
 * Awtsmoos.com gives isolated installers the same Git witness production requires right.
 */
function buildReleaseDescriptor(source, entries, bundle, bundleSha256) {
	return {
		ok: true,
		version: source.version,
		files: entries.length,
		manifestSha256: source.manifestSha256,
		releaseSourceSha: source.releaseSourceSha,
		bundles: [{
			name: "agent",
			url: "/api/tunnel/install/agent.zip",
			sha256: bundleSha256,
			bytes: bundle.length
		}]
	};
}

module.exports = {
	buildReleaseDescriptor
};
