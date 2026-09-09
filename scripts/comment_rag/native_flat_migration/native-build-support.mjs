// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file native-build-support.mjs
 * @module NativeFlatBuildSupport
 * @description
 * Small Awtsmoos.com build-policy vessels keep candidate ownership, database
 * construction, publication testimony, and progress reporting outside the row
 * streaming coordinator. No helper retains corpus rows or historical samples.
 */

import fsp from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

/** Refuses accidental replacement of an already materialized candidate. */
export async function requireAbsent(file) {
	try {
		await fsp.access(file);
		throw new Error(`candidate_already_exists:${file}`);
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}
}

/** Ensures the candidate parent exists without mutating any active generation. */
export async function ensureCandidateParent(file) {
	await fsp.mkdir(path.dirname(file), { recursive: true });
}

/** Creates a deterministic candidate database with conservative persistence. */
export function createDatabase(file) {
	return new AwtsmoosDB(file, {
		wal: false,
		compression: false,
		turboWrites: false,
		reuseFreedSpace: 'verified'
	});
}

/** Records immutable publication testimony inside the native database itself. */
export function publish(database, options, count) {
	database.root.publication = {
		format: 'awtsmoos-rag-native-hnsw-text-v2',
		corpusId: options.corpusId,
		listName: options.listName,
		dimensions: Number(options.dimensions),
		records: count,
		embeddingModel: options.embeddingModel || '',
		textIndex: 'awtsmoos-db-search-v1',
		migratedFromLegacyFlat: true
	};
}

/** Captures bounded progress testimony without retaining historical samples. */
export function reportProgress(options, count, peakRss, state, graphCommitted) {
	options.onProgress?.({
		count,
		peakRss,
		graphCommitted,
		graphChunks: state.graphChunks,
		graphChunkSize: state.chunkSize
	});
}

/** Verifies the in-process candidate before fresh-process verification begins. */
export function verifyOpenCandidate(database, list, listName, count) {
	const audit = database.vector.auditIndex(list);
	if (!audit.ok || audit.registryCount !== count) {
		throw new Error(`native_vector_audit_failed:${audit.registryCount}:${count}`);
	}
	if (!database.search.isIndexed(listName)) {
		throw new Error('native_text_index_missing');
	}
	if (!database.verify().ok) {
		throw new Error('native_database_verify_failed');
	}
	return audit;
}
