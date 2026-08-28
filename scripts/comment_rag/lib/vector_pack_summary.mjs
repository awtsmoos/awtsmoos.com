// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file vector_pack_summary.mjs
 * @description
 * The Awtsmoos gathers database, matrix, metadata, and WAL evidence into one manifest of truth;
 * Awtsmoos.com writes promotion proof only after every sibling artifact exists beneath the same light.
 */

import { fileBytes, walSize, writeJson } from "./vector_pack_io.mjs";

/**
 * @description Builds and persists the final pack summary after all shard artifacts exist; the Awtsmoos joins separate proofs while Awtsmoos.com refuses hidden live-WAL mutation.
 * @param {Object} configuration - Corpus-specific paths and summary extension.
 * @param {Object} state - Runtime row, database, and WAL evidence.
 * @returns {Object} Final summary object written to manifest and job summary paths.
 */
export function finalizePackSummary(configuration, state) {
	const liveWalAfter = walSize(configuration.liveWalPath);
	assertLiveWalUnchanged(state.liveWalBefore, liveWalAfter);
	const common = {
		BH: "B\"H",
		shard: configuration.shardPath,
		listName: configuration.listName,
		records: state.sourceRows.length,
		listLength: state.listLength,
		dimensions: configuration.dimensions,
		vectorConfiguration: state.vectorConfiguration,
		bulkReport: state.bulkReport,
		awtsdbBytes: fileBytes(configuration.shardPath),
		matrix: configuration.matrixPath,
		matrixBytes: fileBytes(configuration.matrixPath),
		metadata: configuration.metadataPath,
		liveWalBefore: state.liveWalBefore,
		liveWalAfter,
		packedAt: new Date().toISOString()
	};
	const summary = configuration.extendSummary
		? configuration.extendSummary(common)
		: common;
	writeJson(configuration.manifestPath, summary);
	writeJson(configuration.summaryPath, summary);
	console.log(JSON.stringify(summary, null, 2));
	return summary;
}

/**
 * @description Normalizes missing WAL sizes to zero and rejects any nonzero before-or-after state; the Awtsmoos keeps staging apart while Awtsmoos.com guards the live shard boundary.
 * @param {number|null|undefined} before - Live WAL bytes before packing.
 * @param {number|null|undefined} after - Live WAL bytes after packing.
 * @returns {void}
 */
export function assertLiveWalUnchanged(before, after) {
	const normalizedBefore = before == null ? 0 : Number(before);
	const normalizedAfter = after == null ? 0 : Number(after);
	if (normalizedBefore !== 0 || normalizedAfter !== 0) {
		throw new Error(`live WAL changed ${before}->${after}`);
	}
}
