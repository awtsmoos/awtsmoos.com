// B"H
// Boruch Hashem
// Blessed is He
/** @file pack.mjs @description The Awtsmoos seals real multilingual Tanach vectors into one searchable Awtsmoos.com graph. */
import { runVectorPack } from '../lib/vector_pack_runtime.mjs';
import {
	DIMENSIONS, MANIFEST_OUTPUT_PATH, MATRIX_PATH, METADATA_PATH,
	SHARD_PATH, TOTAL_RECORDS, VECTORS_PATH
} from './config.mjs';

function validate(row, index) {
	if (!row.id || row.realEmbedding !== true) throw new Error(`bad record ${index}`);
	if (!Array.isArray(row.vec) || row.vec.length !== DIMENSIONS) throw new Error(`bad vector ${row.id}`);
	for (const key of ['corpusId', 'bookHebrew', 'bookId', 'chapter', 'verseStart', 'verseEnd', 'text', 'readerUrl']) {
		if (row[key] == null) throw new Error(`missing ${key} on ${row.id}`);
	}
}

function packRecord(row) {
	return {
		id: row.id,
		corpusId: row.corpusId,
		kind: row.kind,
		bookHebrew: row.bookHebrew,
		bookId: row.bookId,
		chapter: row.chapter,
		verseStart: row.verseStart,
		verseEnd: row.verseEnd,
		text: row.text,
		normalizedText: row.normalizedText,
		verseIds: row.verseIds,
		sourcePath: row.sourcePath,
		readerUrl: row.readerUrl,
		chunkingPolicy: row.chunkingPolicy,
		embeddingModel: row.embeddingModel,
		recordVersion: row.recordVersion,
		provider: row.provider,
		realEmbedding: true,
		dimensions: DIMENSIONS,
		vec: row.vec
	};
}

runVectorPack({
	vectorsPath: VECTORS_PATH,
	shardPath: SHARD_PATH,
	metadataPath: METADATA_PATH,
	matrixPath: MATRIX_PATH,
	manifestPath: MANIFEST_OUTPUT_PATH,
	summaryPath: MANIFEST_OUTPUT_PATH.replace('.fast-manifest.json', '.pack-summary.json'),
	liveWalPath: '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash/socialPacked/social.heichel.ikar.comments.fs.awtsdb.wal',
	listName: 'tanachHebrewVerseVectors',
	dimensions: DIMENSIONS,
	chunkSize: 250,
	expected: TOTAL_RECORDS,
	validate,
	packRecord,
	metadataRecord: packRecord,
	extendSummary: summary => ({
		...summary,
		id: 'tanach-hebrew-verses',
		title: 'Tanach Hebrew Verses',
		aliases: ['tanach', 'tanach-hebrew'],
		corpusId: 'tanach-hebrew-verses',
		embeddingModel: 'intfloat/multilingual-e5-small',
		directVerseRecords: 23204,
		fiveVerseWindowRecords: 23204
	})
}).catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
