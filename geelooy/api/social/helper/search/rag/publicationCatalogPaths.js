//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file publicationCatalogPaths.js
 * @description
 * The Awtsmoos lets one tiny native publication catalog name immutable search
 * vessels without trusting arbitrary absolute paths. Awtsmoos.com resolves the
 * three reviewed roots once per request and fails closed on every unsafe name.
 */

const path = require('node:path');
const {
	likkuteiSichosStagingRoot,
	ragRoot,
	sichosKodeshStagingRoot
} = require('./paths.js');

const CATALOG_NAME = 'publication-catalog.awtsdb';
const SAFE_NAME = /^[a-z0-9][a-z0-9._-]*$/i;

/** Returns the immutable native catalog file for the active RAG root. */
function publicationCatalogPath($i) {
	return path.join(ragRoot($i), CATALOG_NAME);
}

/** Resolves all reviewed roots once so multipart discovery never repeats probes. */
function publicationRoots($i) {
	return {
		live: ragRoot($i),
		'sichos-staging': sichosKodeshStagingRoot($i),
		'likkutei-staging': likkuteiSichosStagingRoot($i)
	};
}

/** Selects one known root from an already-resolved root set. */
function publicationRootFrom(roots, kind) {
	const root = roots?.[kind];
	if (!root) {
		throw coded('RAG_PUBLICATION_ROOT_MISSING', `Publication root is unavailable: ${kind}`);
	}
	return root;
}

/** Resolves one safe basename beneath an already-approved publication root. */
function publicationFileFrom(roots, kind, name) {
	if (!SAFE_NAME.test(String(name || '')) || path.basename(name) !== name) {
		throw coded('RAG_PUBLICATION_NAME_UNSAFE', `Unsafe publication name: ${name}`);
	}
	return path.join(publicationRootFrom(roots, kind), name);
}

/** Compatibility resolver for callers that need only one publication path. */
function publicationFile($i, kind, name) {
	return publicationFileFrom(publicationRoots($i), kind, name);
}

/** Returns a coded error so readiness failures remain machine-actionable. */
function coded(code, message) {
	return Object.assign(new Error(message), { code });
}

module.exports = {
	CATALOG_NAME,
	publicationCatalogPath,
	publicationFile,
	publicationFileFrom,
	publicationRoots
};
