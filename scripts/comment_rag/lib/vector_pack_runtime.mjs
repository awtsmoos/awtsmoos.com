// B"H

/**
 * @file scripts/comment_rag/lib/vector_pack_runtime.mjs
 * @chapter The Canonical Vessel Is Filled Before Its Graph Is Woven
 * @description
 * Runs one bounded bulk load, one final vector rebuild, sidecar generation, WAL
 * isolation checks, and durable summaries for comment-vector shards.
 */

import { createRequire } from 'module';
import {
	fileBytes,
	readJsonLines,
	removeShardArtifacts,
	walSize,
	writeJson,
	writeSidecars
} from './vector_pack_io.mjs';

const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

export async function runVectorPack(configuration) {
	const liveWalBefore = walSize(configuration.liveWalPath);
	const sourceRows = readJsonLines(configuration.vectorsPath, configuration.validate);
	if (configuration.expected && sourceRows.length !== configuration.expected) {
		throw new Error(`expected ${configuration.expected}, got ${sourceRows.length}`);
	}
	const records = sourceRows.map(configuration.packRecord);
	removeShardArtifacts(configuration.shardPath);
	const db = new AwtsmoosDB(configuration.shardPath, {
		debug: false,
		wal: false,
		compression: false,
		turboWrites: false,
		reuseFreedSpace: 'verified'
	});
	let bulkReport;
	let listLength;
	let vectorConfiguration;
	try {
		await db.open();
		await db.createList(db.root, configuration.listName);
		bulkReport = await db.vector.bulkLoad(db.root[configuration.listName], records, {
			dimensions: configuration.dimensions,
			metric: 'cosine',
			chunkSize: configuration.chunkSize,
			onProgress: progress => console.log(`B"H loaded ${progress.loaded}/${progress.total}`)
		});
		listLength = db.root[configuration.listName].length;
		vectorConfiguration = db.vector.configurations()
			.find(item => item.path === `root.${configuration.listName}`) || null;
	} finally {
		await db.close?.();
	}
	await writeSidecars(sourceRows, {
		dimensions: configuration.dimensions,
		matrixPath: configuration.matrixPath,
		metadataPath: configuration.metadataPath,
		metadataRecord: configuration.metadataRecord
	});
	const liveWalAfter = walSize(configuration.liveWalPath);
	if (liveWalBefore !== 0 || liveWalAfter !== 0) {
		throw new Error(`live WAL changed ${liveWalBefore}->${liveWalAfter}`);
	}
	const common = {
		BH: 'B"H',
		shard: configuration.shardPath,
		listName: configuration.listName,
		records: sourceRows.length,
		listLength,
		dimensions: configuration.dimensions,
		vectorConfiguration,
		bulkReport,
		awtsdbBytes: fileBytes(configuration.shardPath),
		matrix: configuration.matrixPath,
		matrixBytes: fileBytes(configuration.matrixPath),
		metadata: configuration.metadataPath,
		liveWalBefore,
		liveWalAfter,
		packedAt: new Date().toISOString()
	};
	const summary = configuration.extendSummary ? configuration.extendSummary(common) : common;
	writeJson(configuration.manifestPath, summary);
	writeJson(configuration.summaryPath, summary);
	console.log(JSON.stringify(summary, null, 2));
	return summary;
}
