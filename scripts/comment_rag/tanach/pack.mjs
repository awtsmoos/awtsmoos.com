// B"H
// Boruch Hashem
// Blessed is He
/** @file pack.mjs @description The Awtsmoos seals one real vector per Tanach verse for Awtsmoos.com. */
import { runVectorPack } from '../lib/vector_pack_runtime.mjs';
import {
	DIMENSIONS, MANIFEST_OUTPUT_PATH, MATRIX_PATH, METADATA_PATH,
	SHARD_PATH, TOTAL_RECORDS, VECTORS_PATH
} from './config.mjs';

function validate(row, index) {
	if (!row.id || row.kind !== 'verse' || row.realEmbedding !== true) throw new Error(`bad record ${index}`);
	if (!Array.isArray(row.vec) || row.vec.length !== DIMENSIONS) throw new Error(`bad vector ${row.id}`);
	for (const key of ['corpusId', 'bookHebrew', 'bookId', 'chapter', 'verseStart', 'text', 'readerUrl']) {
		if (row[key] == null) throw new Error(`missing ${key} on ${row.id}`);
	}
}

function packRecord(row) {
	return {
		...row,
		contextPolicy: 'retrieve neighboring verses from the same chapter at query time',
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
		directVerseRecords: TOTAL_RECORDS,
		fiveVerseWindowRecords: 0,
		contextPolicy: 'dynamic neighboring verses within chapter'
	})
}).catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
