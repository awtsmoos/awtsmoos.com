//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file nativePublicationCatalogFixture.js
 * @description
 * The Awtsmoos gives tests one genuine tiny AwtsmoosDB publication seal and one
 * seed database file. Awtsmoos.com therefore proves native startup behavior
 * without preserving JSON-era fixtures or loading corpus payloads.
 */

const fs = require('node:fs/promises');
const path = require('node:path');
const AwtsmoosDB = require('../../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

/** Creates the smallest native publication generation accepted by startup readiness. */
async function createNativePublicationFixture(root, records = 2, dimensions = 384) {
	const ragRoot = path.join(root, 'ai', 'comment-rag');
	const seedName = 'meluket-english-comments-rag.awtsdb';
	const catalogFile = path.join(ragRoot, 'publication-catalog.awtsdb');
	await fs.mkdir(ragRoot, { recursive: true });
	await fs.writeFile(path.join(ragRoot, seedName), 'B"H immutable seed database');
	const database = new AwtsmoosDB(catalogFile, { compression: false });
	await database.open();
	try {
		database.root.publications = new database.Map();
		await database.root.publications.set(seedName, descriptor(seedName, records, dimensions));
		database.root.meta = metadata(seedName, records, dimensions);
		await database.waitForIdle();
	} finally {
		await database.close();
	}
	return { catalogFile, ragRoot, seedName };
}

/** Returns one compact English semantic publication descriptor. */
function descriptor(databaseName, records, dimensions) {
	return {
		id: 'meluket',
		title: 'Meluket Fixture',
		aliases: ['meluket'],
		rootKind: 'live',
		databaseName,
		textName: null,
		matrixName: null,
		listName: 'meluketEnglishCommentVectors',
		count: records,
		dimensions,
		embeddingModel: 'fixture-model',
		indexType: 'hnsw',
		partNumber: 1,
		expectedParts: 1,
		partial: false,
		textOnly: false,
		vectorEnabled: true,
		contentLanguage: 'en',
		semanticEligible: true
	};
}

/** Returns deterministic readiness testimony matching the production catalog seal. */
function metadata(databaseName, records, dimensions) {
	return {
		format: 'awtsmoos-rag-publication-catalog-v1',
		generation: 'fixture-generation',
		publicationCount: 1,
		semanticPublicationCount: 1,
		semanticSeedId: 'meluket',
		semanticSeedRecords: records,
		semanticSeedDimensions: dimensions,
		semanticSeedRootKind: 'live',
		semanticSeedDatabaseName: databaseName
	};
}

module.exports = {
	createNativePublicationFixture
};
