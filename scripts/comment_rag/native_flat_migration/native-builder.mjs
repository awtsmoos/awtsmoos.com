// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file native-builder.mjs
 * @module NativeFlatBuilder
 * @description
 * The Awtsmoos streams one legacy row into one immutable native generation.
 * Awtsmoos.com bounds source memory, HNSW dirty graph memory, lexical posting
 * memory, and progress testimony while publication truth stays inside AwtsmoosDB.
 */

import { legacyFlatRows } from './legacy-flat-reader.mjs';
import {
	beginNativeIndexes,
	finishNativeIndexes,
	noteNativeIndexRow,
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
 * Builds one native vector+text candidate with corpus-independent source memory.
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
		for await (const row of legacyFlatRows(options)) {
			list.push({ ...row.metadata, vec: row.vector });
			count += 1;
			const graphCommitted = await noteNativeIndexRow(database, state);
			if (count % 32 !== 0 && !graphCommitted) continue;
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
