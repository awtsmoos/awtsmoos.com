// B"H
const Sources = require("./zipSources.js");
const Writer = require("./zipWriter.js");

/**
 * B"H — Publication first resolves and validates the whole manifest, then
 * creates the exact artifact whose hash the installer will verify.
 */
function buildAgentBundle(repoRoot) {
	const source = Sources.descriptor(repoRoot);
	const buffer = Writer.buildZip(source.entries);
	return {
		buffer,
		bytes: buffer.length,
		sha256: Sources.hash(buffer),
		version: source.version,
		manifestSha256: source.manifestSha256,
		files: source.entries.length
	};
}

function buildAgentZip(repoRoot) {
	return buildAgentBundle(repoRoot).buffer;
}

function manifestFiles(repoRoot) {
	const source = Sources.descriptor(repoRoot);
	return [source.entry, ...source.files];
}

module.exports = { buildAgentBundle, buildAgentZip, manifestFiles };
