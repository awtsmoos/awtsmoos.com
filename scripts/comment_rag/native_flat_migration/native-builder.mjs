// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file native-builder.mjs
 * @module NativeFlatBuilder
 * @description
 * The Awtsmoos lifts one legacy vector row at a time into one immutable native
 * generation. Awtsmoos.com creates HNSW and Unicode lexical postings together,
 * never gathers the corpus into an array, and never writes JSON serving truth.
 */

import fsp from 'node:fs/promises';
import { createRequire } from 'node:module';
import { legacyFlatRows } from './legacy-flat-reader.mjs';
import {
	beginNativeIndexes,
	finishNativeIndexes,
	releaseNativeIndexMode
} from './native-indexes.mjs';

const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

/** Refuses accidental replacement of an already materialized candidate. */
async function requireAbsent(file) {
	try {
		await fsp.access(file);
		throw new Error(`candidate_already_exists:${file}`);
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}
}

/** Creates a deterministic write-bounded native candidate database. */
function createDatabase(file) {
	return new AwtsmoosDB(file, {
		wal: false,
		compression: false,
		turboWrites: false,
		reuseFreedSpace: 'verified'
	});
}

/** Records immutable publication testimony inside the native database itself. */
function publish(database, options, count) {
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

/**
 * Builds one native vector+text candidate with constant corpus memory.
 * @param {object} options Migration configuration.
 * @returns {Promise<object>} Build evidence suitable for fresh-process verification.
 */
export async function buildNativeCandidate(options) {
	await requireAbsent(options.outputFile);
	await fsp.mkdir(new URL('.', `file://${options.outputFile}`).pathname, {
		recursive: true
	}).catch(() => {});
	const database = createDatabase(options.outputFile);
	let count = 0;
	let peakRss = process.memoryUsage().rss;
	try {
		await database.open();
		await database.createList(database.root, options.listName);
		const list = database.root[options.listName];
		beginNativeIndexes(database, list, options.dimensions);
		for await (const row of legacyFlatRows(options)) {
			list.push({ ...row.metadata, vec: row.vector });
			count += 1;
			if (count % 32 !== 0) continue;
			await database.waitForIdle();
			peakRss = Math.max(peakRss, process.memoryUsage().rss);
			options.onProgress?.({ count, peakRss });
		}
		await finishNativeIndexes(database);
		publish(database, options, count);
		await database.waitForIdle();
		const audit = database.vector.auditIndex(list);
		if (!audit.ok || audit.registryCount !== count) {
			throw new Error(`native_vector_audit_failed:${audit.registryCount}:${count}`);
		}
		if (!database.search.isIndexed(options.listName)) {
			throw new Error('native_text_index_missing');
		}
		if (!database.verify().ok) throw new Error('native_database_verify_failed');
		return {
			count,
			peakRss,
			audit,
			textIndexed: true
		};
	} finally {
		releaseNativeIndexMode(database);
		await database.close();
	}
}
