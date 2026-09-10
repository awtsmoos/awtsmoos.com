//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file publicationCatalogReader.js
 * @description
 * The Awtsmoos opens one tiny native catalog through the same strict read-only
 * database used by immutable search shards, streams bounded descriptors, resolves
 * publication roots once, and closes immediately without corpus-list hydration.
 */

const fs = require('node:fs');
const SearchDatabase = require('./searchDatabase.js');
const {
	publicationCatalogPath,
	publicationFileFrom,
	publicationRoots
} = require('./publicationCatalogPaths.js');

const FORMAT = 'awtsmoos-rag-publication-catalog-v1';
const MAX_PUBLICATIONS = 128;
const RANGE_END = '\uffff';

/** Resolves a persisted proxy value without resolving any publication corpus. */
function resolveValue(value) {
	if (value && typeof value.__resolve__ === 'function') return value.__resolve__();
	return value;
}

/** Reads every tiny descriptor from one native catalog with a hard item ceiling. */
async function readPublicationCatalog($i) {
	const file = publicationCatalogPath($i);
	if (!fs.existsSync(file)) {
		throw coded('RAG_PUBLICATION_CATALOG_MISSING', `Native RAG catalog is missing: ${file}`);
	}
	const database = new SearchDatabase(file);
	const roots = publicationRoots($i);
	const items = [];
	try {
		database.open();
		const meta = resolveValue(database.root.meta) || {};
		if (meta.format !== FORMAT || !database.root.publications) {
			throw coded('RAG_PUBLICATION_CATALOG_INVALID', 'Native RAG catalog is incomplete.');
		}
		for await (const row of database.range(database.root.publications, '', RANGE_END)) {
			const descriptor = resolveValue(row?.value);
			if (descriptor) items.push(hydrateDescriptor($i, descriptor, roots));
			if (items.length > MAX_PUBLICATIONS) {
				throw coded('RAG_PUBLICATION_CATALOG_OVERSIZED', 'Native RAG catalog exceeds its hard publication budget.');
			}
		}
		if (Number(meta.publicationCount || 0) !== items.length) {
			throw coded('RAG_PUBLICATION_CATALOG_COUNT_MISMATCH', 'Native RAG catalog count does not match its metadata.');
		}
		return { generation: String(meta.generation || ''), items };
	} finally {
		database.close();
	}
}

/** Converts one compact descriptor into the existing physical shard contract. */
function hydrateDescriptor($i, descriptor = {}, roots = publicationRoots($i)) {
	const file = publicationFileFrom(roots, descriptor.rootKind, descriptor.databaseName);
	const textFile = descriptor.textName
		? publicationFileFrom(roots, descriptor.rootKind, descriptor.textName)
		: null;
	const matrixFile = descriptor.matrixName
		? publicationFileFrom(roots, descriptor.rootKind, descriptor.matrixName)
		: null;
	if (!fs.existsSync(file)) {
		throw coded('RAG_PUBLICATION_FILE_MISSING', `Published database is missing: ${file}`);
	}
	return hydratedShape(descriptor, file, textFile, matrixFile);
}

/** Shapes one hydrated descriptor without re-running publication-root discovery. */
function hydratedShape(descriptor, file, textFile, matrixFile) {
	return {
		...descriptor,
		file,
		textFile: textFile && fs.existsSync(textFile) ? textFile : null,
		matrixFile: matrixFile && fs.existsSync(matrixFile) ? matrixFile : null,
		bytes: fs.statSync(file).size,
		aliases: Array.isArray(descriptor.aliases) ? [...descriptor.aliases] : [],
		count: Number(descriptor.count || 0),
		dimensions: Number(descriptor.dimensions || 0),
		partNumber: Number(descriptor.partNumber || 0),
		expectedParts: Number(descriptor.expectedParts || 1),
		vectorEnabled: descriptor.vectorEnabled === true,
		textOnly: descriptor.textOnly === true,
		partial: descriptor.partial === true
	};
}

/** Returns a coded error for stable readiness and deployment diagnosis. */
function coded(code, message) {
	return Object.assign(new Error(message), { code });
}

module.exports = {
	FORMAT,
	MAX_PUBLICATIONS,
	hydrateDescriptor,
	readPublicationCatalog
};
