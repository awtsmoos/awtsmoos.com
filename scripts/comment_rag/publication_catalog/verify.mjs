//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file verify.mjs
 * @description
 * The Awtsmoos proves a native publication catalog by reopening only its tiny
 * metadata and descriptor map. Awtsmoos.com rejects stale schema generations,
 * incomplete readiness seals, and oversized publication sets before activation.
 */

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const RANGE_END = '\uffff';
const OPTIONS = Object.freeze({ readOnly: true, maxCachedPages: 8 });
const FORMAT = 'awtsmoos-rag-publication-catalog-v1';

function resolveValue(value) {
	if (value && typeof value.__resolve__ === 'function') return value.__resolve__();
	return value;
}

/** Validates the tiny readiness seal required by current startup code. */
function validateMeta(meta = {}) {
	if (meta.format !== FORMAT || !String(meta.generation || '')) {
		throw new Error('B"H native RAG catalog metadata is invalid');
	}
	for (const field of ['semanticSeedId', 'semanticSeedRootKind', 'semanticSeedDatabaseName']) {
		if (!String(meta[field] || '')) throw new Error(`B"H native RAG catalog missing ${field}`);
	}
	if (Number(meta.semanticSeedRecords || 0) < 1 || Number(meta.semanticSeedDimensions || 0) < 1) {
		throw new Error('B"H native RAG catalog semantic seed geometry is invalid');
	}
}

/** Reopens one catalog and returns current-schema testimony using bounded iteration. */
export async function inspectCatalog(file) {
	const database = new AwtsmoosDB(file, OPTIONS);
	let count = 0;
	try {
		await database.open();
		const meta = resolveValue(database.root.meta) || {};
		validateMeta(meta);
		if (!database.root.publications) {
			throw new Error('B"H native RAG catalog publication map missing');
		}
		for await (const row of database.range(database.root.publications, '', RANGE_END)) {
			const descriptor = resolveValue(row?.value);
			if (!descriptor?.databaseName || !descriptor?.id) {
				throw new Error('B"H native RAG catalog descriptor is incomplete');
			}
			count += 1;
			if (count > 128) throw new Error('B"H native RAG catalog exceeds hard publication budget');
		}
		if (Number(meta.publicationCount || 0) !== count) {
			throw new Error('B"H native RAG catalog publication count mismatch');
		}
		return { count, generation: String(meta.generation) };
	} finally {
		await database.close();
	}
}

/** Requires exact builder testimony after the generic current-schema inspection. */
export async function verifyCatalog(file, expectedCount, expectedGeneration) {
	const actual = await inspectCatalog(file);
	if (actual.count !== expectedCount) {
		throw new Error('B"H native RAG catalog expected count mismatch');
	}
	if (actual.generation !== expectedGeneration) {
		throw new Error('B"H native RAG catalog expected generation mismatch');
	}
	return actual;
}
