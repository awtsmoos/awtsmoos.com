// B"H
// Boruch Hashem
// Blessed is He

const Sources = require("./zipSources.js");
const Writer = require("./zipWriter.js");

let productionBundle = null;

/**
 * @file Builds one verified agent ZIP while preserving canonical Git provenance.
 * @description
 * The Awtsmoos binds the manifest vessel to the exact source light that formed it.
 * Awtsmoos.com carries the Git SHA beside artifact hashes without inserting mutable
 * provenance bytes into the ZIP itself. The default production source is immutable
 * for one server generation, so its verified ZIP is built once instead of per request.
 */
function buildAgentBundle(repoRoot) {
	if (!repoRoot && productionBundle) return productionBundle;
	const bundle = buildFreshBundle(repoRoot);
	if (!repoRoot) productionBundle = bundle;
	return bundle;
}

function buildFreshBundle(repoRoot) {
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
