//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file publicationReadiness.js
 * @description
 * The Awtsmoos reads only the tiny native publication seal during synchronous
 * startup. Awtsmoos.com proves one reviewed semantic seed exists without opening
 * corpus rows, resolving publication maps, or touching JSON/JSONL sidecars.
 */

const fs = require('node:fs');
const SearchDatabase = require('./searchDatabase.js');
const {
	publicationCatalogPath,
	publicationFile
} = require('./publicationCatalogPaths.js');

const FORMAT = 'awtsmoos-rag-publication-catalog-v1';

/** Resolves one tiny inline catalog value, never a corpus-sized collection. */
function resolveTiny(value) {
	if (value && typeof value.__resolve__ === 'function') return value.__resolve__();
	return value;
}

/** Reads native readiness testimony and proves its seed database still exists. */
function readPublicationReadiness($i) {
	const catalogFile = publicationCatalogPath($i);
	if (!fs.existsSync(catalogFile)) {
		throw coded('RAG_PUBLICATION_CATALOG_MISSING', `Native RAG catalog is missing: ${catalogFile}`);
	}
	const database = new SearchDatabase(catalogFile);
	try {
		database.open();
		const meta = resolveTiny(database.root.meta) || {};
		validateMeta(meta);
		const seedFile = publicationFile(
			$i,
			meta.semanticSeedRootKind,
			meta.semanticSeedDatabaseName
		);
		if (!fs.existsSync(seedFile) || fs.statSync(seedFile).size <= 0) {
			throw coded('RAG_SEMANTIC_SEED_MISSING', `Semantic seed database is unavailable: ${seedFile}`);
		}
		return resultFrom(meta, catalogFile, seedFile);
	} finally {
		database.close();
	}
}

/** Refuses incomplete or legacy publication seals before startup reports ready. */
function validateMeta(meta) {
	if (meta.format !== FORMAT || !String(meta.generation || '')) {
		throw coded('RAG_PUBLICATION_CATALOG_INVALID', 'Native RAG catalog metadata is invalid.');
	}
	if (!meta.semanticSeedId || !meta.semanticSeedDatabaseName || !meta.semanticSeedRootKind) {
		throw coded('RAG_SEMANTIC_SEED_UNDECLARED', 'Native RAG catalog has no reviewed semantic seed.');
	}
	if (Number(meta.semanticSeedRecords || 0) < 1 || Number(meta.semanticSeedDimensions || 0) < 1) {
		throw coded('RAG_SEMANTIC_SEED_INVALID', 'Native RAG semantic seed has invalid geometry.');
	}
}

/** Shapes the compact startup testimony without exposing filesystem internals publicly. */
function resultFrom(meta, catalogFile, seedFile) {
	return {
		ok: true,
		generation: String(meta.generation),
		publicationCount: Number(meta.publicationCount || 0),
		semanticPublicationCount: Number(meta.semanticPublicationCount || 0),
		seedId: String(meta.semanticSeedId),
		records: Number(meta.semanticSeedRecords),
		dimensions: Number(meta.semanticSeedDimensions),
		catalogFile,
		seedFile
	};
}

/** Returns a coded readiness error so operators can distinguish failure classes. */
function coded(code, message) {
	return Object.assign(new Error(message), { code });
}

module.exports = {
	FORMAT,
	readPublicationReadiness,
	validateMeta
};
