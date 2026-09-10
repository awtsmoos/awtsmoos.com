//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file immutableRagWarmup.js
 * @description
 * The Awtsmoos proves immutable semantic readiness from one native publication
 * seal. Awtsmoos.com never enumerates manifest files or opens JSONL mirrors merely
 * to decide that a reviewed search generation is structurally alive.
 */

const { ragRoot } = require('./paths.js');
const { readPublicationReadiness } = require('./publicationReadiness.js');
const { rootFromInterface } = require('./warmupRoot.js');

/** Reads one native readiness seal and returns compact startup testimony. */
function warmImmutableRagCorpus($i = null) {
	const root = rootFromInterface($i);
	const context = { db: { directory: root } };
	const readiness = readPublicationReadiness(context);
	return {
		ok: true,
		root,
		ragRoot: ragRoot(context),
		generation: readiness.generation,
		publicationCount: readiness.publicationCount,
		semanticPublicationCount: readiness.semanticPublicationCount,
		seedId: readiness.seedId,
		records: readiness.records,
		dimensions: readiness.dimensions
	};
}

module.exports = {
	warmImmutableRagCorpus
};
