// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file native-builder.mjs
 * @module NativeFlatBuilder
 * @description
 * Awtsmoos.com streams legacy semantic rows into one immutable native generation.
 * Source memory, DB transaction size, HNSW dirty graph memory, and lexical posting
 * memory are all bounded by the same small build chunk rather than corpus size.
 */

import { legacyFlatRows } from './legacy-flat-reader.mjs';
import { boundedChunks, writeNativeChunk } from './native-chunks.mjs';
import {
	beginNativeIndexes,
	finishNativeIndexes,
	noteNativeIndexRows,
	releaseNativeIndexMode
} from './native-indexes.mjs';
import {
	createDatabase,
	ensureCandidateParent,
	publish,
	reportProgress,
	requireAbsent,
	verifyOpenCandidate
} from './native-build-support.mjs';

/**
 * Builds one native vector+text candidate with memory proportional to chunk size.
 * @param {object} options Migration configuration and graph chunk policy.
 * @returns {Promise<object>} Evidence suitable for fresh-process verification.
 */
export async function buildNativeCandidate(options) {
	await requireAbsent(options.outputFile);
	await ensureCandidateParent(options.outputFile);
	const database = createDatabase(options.outputFile);
	let count = 0;
	let peakRss = process.memoryUsage().rss;
	let state = null;
	try {
		await database.open();
		await database.createList(database.root, options.listName);
		const list = database.root[options.listName];
		state = beginNativeIndexes(database, list, options.dimensions, {
			graphChunkSize: options.graphChunkSize
		});
		const source = legacyFlatRows(options);
		for await (const chunk of boundedChunks(source, state.chunkSize)) {
			const written = writeNativeChunk(database, list, chunk);
			count += written;
			const graphCommitted = await noteNativeIndexRows(database, state, written);
			peakRss = Math.max(peakRss, process.memoryUsage().rss);
			reportProgress(options, count, peakRss, state, graphCommitted);
		}
		const indexBuild = await finishNativeIndexes(database, state);
		peakRss = Math.max(peakRss, process.memoryUsage().rss);
		publish(database, options, count);
		await database.waitForIdle();
		const audit = verifyOpenCandidate(
			database,
			list,
			options.listName,
			count
		);
		return {
			count,
			peakRss,
			audit,
			textIndexed: true,
			...indexBuild
		};
	} finally {
		releaseNativeIndexMode(database, state);
		await database.close();
	}
}
