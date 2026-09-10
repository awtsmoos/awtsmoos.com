//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file warmupPublication.js
 * @description
 * The Awtsmoos preserves the historical warmup module name while its authority
 * is now native. Awtsmoos.com reads the publication seal instead of JSON
 * manifests, matrices, or metadata mirrors during startup readiness.
 */

const path = require('node:path');
const { readPublicationReadiness } = require('./publicationReadiness.js');

const SEED_BASENAME = 'meluket-english-comments-rag';

/** Adapts the old root-shaped helper to the native publication readiness seal. */
function readSeedManifest(ragDirectory) {
	const databaseRoot = path.dirname(path.dirname(path.resolve(ragDirectory)));
	const readiness = readPublicationReadiness({ db: { directory: databaseRoot } });
	return {
		id: readiness.seedId,
		records: readiness.records,
		listLength: readiness.records,
		dimensions: readiness.dimensions,
		vectorEnabled: true,
		generation: readiness.generation
	};
}

/** Proves the active native catalog and reviewed semantic seed database exist. */
function probePublishedRag($i) {
	return readPublicationReadiness($i);
}

module.exports = {
	SEED_BASENAME,
	probePublishedRag,
	readSeedManifest
};
