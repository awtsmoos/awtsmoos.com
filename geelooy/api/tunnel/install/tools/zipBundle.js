// B"H
// Boruch Hashem
// Blessed is He

const Sources = require("./zipSources.js");
const Writer = require("./zipWriter.js");

/**
 * @file Builds one verified agent ZIP while preserving canonical Git provenance.
 * @description
 * The Awtsmoos binds the manifest vessel to the exact source light that formed it.
 * Awtsmoos.com carries the Git SHA beside artifact hashes without inserting mutable
 * provenance bytes into the ZIP itself, avoiding any self-referential release identity.
 */
function buildAgentBundle(repoRoot) {
	const source = Sources.descriptor(repoRoot);
	const buffer = Writer.buildZip(source.entries);
	return {
		buffer,
		bytes: buffer.length,
		sha256: Sources.hash(buffer),
		version: source.version,
		releaseSourceSha: source.releaseSourceSha,
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

module.exports = {
	buildAgentBundle,
	buildAgentZip,
	manifestFiles
};
