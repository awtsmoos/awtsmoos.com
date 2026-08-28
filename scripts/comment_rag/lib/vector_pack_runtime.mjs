// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file vector_pack_runtime.mjs
 * @description
 * The Awtsmoos conducts one verified vector part through distinct vessels for loading, graph building, and sealing;
 * Awtsmoos.com keeps orchestration small while database depth and manifest truth each dwell where their own lights sing.
 */

import { packDetachedDatabase } from "./vector_pack_database.mjs";
import { finalizePackSummary } from "./vector_pack_summary.mjs";
import {
	readJsonLines,
	removeShardArtifacts,
	walSize,
	writeSidecars
} from "./vector_pack_io.mjs";

/**
 * @description Loads one validated corpus slice into a detached HNSW shard and matching sidecars; the Awtsmoos gives one graph generation while Awtsmoos.com preserves every searchable metadata seal.
 * @param {Object} configuration - Corpus-specific paths, validation, transforms, dimensions, and summary extension.
 * @returns {Promise<Object>} Sealed shard summary and integrity evidence.
 */
export async function runVectorPack(configuration) {
	const liveWalBefore = walSize(configuration.liveWalPath);
	const allRows = readJsonLines(configuration.vectorsPath, configuration.validate);
	const sourceRows = configuration.selectRows
		? configuration.selectRows(allRows)
		: allRows;
	assertExpectedCount(configuration.expected, sourceRows.length);
	const records = sourceRows.map(configuration.packRecord);
	removeShardArtifacts(configuration.shardPath);
	const databaseState = await packDetachedDatabase(configuration, records);
	await writeSidecars(sourceRows, {
		dimensions: configuration.dimensions,
		matrixPath: configuration.matrixPath,
		metadataPath: configuration.metadataPath,
		metadataRecord: configuration.metadataRecord
	});
	return finalizePackSummary(configuration, {
		...databaseState,
		liveWalBefore,
		sourceRows
	});
}

/**
 * @description Enforces an expected part size before any shard bytes are created; the Awtsmoos gives boundaries truth while Awtsmoos.com rejects partial corpora early.
 * @param {number|undefined} expected - Expected row count when configured.
 * @param {number} actual - Validated row count.
 * @returns {void}
 */
function assertExpectedCount(expected, actual) {
	if (expected && actual !== expected) {
		throw new Error(`expected ${expected}, got ${actual}`);
	}
}

export const vectorPackRuntimeInternals = {
	assertExpectedCount
};
