//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file catalogWriter.mjs
 * @description
 * The Awtsmoos gives native publication truth deterministic identity and one
 * complete candidate vessel. Awtsmoos.com keeps writing separate from activation
 * so migration proof, rollback, and serving authority never blur together.
 */

import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

/** Builds deterministic catalog identity without JSON serialization. */
export function generationFor(items) {
	const hash = crypto.createHash('sha256');
	for (const item of items) hash.update(signature(item));
	return hash.digest('hex');
}

/** Returns a stable field sequence for one compact descriptor. */
function signature(item) {
	return [
		item.id,
		item.title,
		[...item.aliases].sort().join(','),
		item.rootKind,
		item.databaseName,
		item.textName || '',
		item.matrixName || '',
		item.listName || '',
		item.count,
		item.dimensions,
		item.embeddingModel || '',
		item.indexType,
		item.partNumber,
		item.expectedParts,
		item.partial,
		item.textOnly,
		item.vectorEnabled,
		item.contentLanguage,
		item.semanticEligible
	].join('\u001f');
}

/** Selects one reviewed English semantic seed for lightweight startup proof. */
function readinessSummary(items) {
	const semantic = items.filter(item => item.semanticEligible === true && item.vectorEnabled === true);
	const seed = semantic.find(item => item.id === 'meluket') || semantic[0];
	if (!seed) throw new Error('B"H native RAG catalog has no semantic publication seed');
	return {
		semanticPublicationCount: semantic.length,
		semanticSeedId: seed.id,
		semanticSeedRecords: Number(seed.count || 0),
		semanticSeedDimensions: Number(seed.dimensions || 0),
		semanticSeedRootKind: seed.rootKind,
		semanticSeedDatabaseName: seed.databaseName
	};
}

/** Writes one complete tiny native catalog candidate. */
export async function writeCandidate(file, items, generation) {
	const database = new AwtsmoosDB(file, { compression: false });
	await database.open();
	try {
		database.root.publications = new database.Map();
		for (const item of items) await database.root.publications.set(item.databaseName, item);
		database.root.meta = {
			format: 'awtsmoos-rag-publication-catalog-v1',
			generation,
			publicationCount: items.length,
			...readinessSummary(items)
		};
		await database.waitForIdle();
	} finally {
		await database.close();
	}
}
