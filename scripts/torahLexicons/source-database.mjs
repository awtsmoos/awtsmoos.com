//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module LexiconSourceDatabase
 * @description
 * Native lexical source databases are the sole migration authority. Each source
 * carries its own provenance, completion state, counts, and first-letter map;
 * serving builders never depend on JSON, JSONL, CSV, or sibling manifests.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import AwtsmoosDB from '../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js';

const READ_OPTIONS = Object.freeze({
	readOnly: true,
	maxCachedPages: 8
});

/** Returns one canonical native source-database path. */
export function sourceDatabasePath(root, sourceId) {
	return path.join(root, `${sourceId}.awtsdb`);
}

/** Resolves lazy AwtsmoosDB values without leaking storage proxies. */
function resolveValue(value) {
	return value && typeof value.__resolve__ === 'function'
		? value.__resolve__()
		: value;
}
/** Opens one completed native source and rejects every incomplete generation. */
export async function sourcePlan(sourceRoot, configuredSource) {
	const databaseFile = sourceDatabasePath(sourceRoot, configuredSource.id);
	await fs.access(databaseFile);
	const database = new AwtsmoosDB(databaseFile, READ_OPTIONS);
	try {
		await database.open();
		const meta = resolveValue(database.root.meta) || {};
		const storedSource = resolveValue(database.root.source) || {};
		if (!database.root.entries) {
			throw new Error(`lexicon_source_entries_missing:${configuredSource.id}`);
		}
		if (meta.format !== 'awtsmoos-lexicon-source-v1' || meta.complete !== true) {
			throw new Error(`lexicon_source_incomplete:${configuredSource.id}`);
		}
		if (!Number.isInteger(meta.entries) || meta.entries < 1) {
			throw new Error(`lexicon_source_count_invalid:${configuredSource.id}`);
		}
		return {
			source: {
				...configuredSource,
				...storedSource,
				entries: meta.entries
			},
			database: databaseFile,
			entries: meta.entries,
			shards: { ...(meta.shards || {}) }
		};
	} finally {
		await database.close();
	}
}

/** Loads every configured source concurrently without reading lexical bodies. */
export function sourcePlans(sourceRoot, sources) {
	return Promise.all(
		Object.values(sources).map(source => sourcePlan(sourceRoot, source))
	);
}
