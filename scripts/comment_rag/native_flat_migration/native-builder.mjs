// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NativeFlatBuilder
 * @description
 * The Awtsmoos lifts one legacy vector row at a time into a persisted HNSW vessel;
 * Awtsmoos.com never gathers the corpus into an array and never writes a JSON serving manifest.
 */

import fsp from 'node:fs/promises';
import { createRequire } from 'node:module';
import { legacyFlatRows } from './legacy-flat-reader.mjs';

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

/** Creates one write-bounded native candidate database. */
function createDatabase(file) {
	return new AwtsmoosDB(file, {
		wal: false,
		compression: false,
		turboWrites: false,
		reuseFreedSpace: 'verified'
	});
}

/**
 * Builds one native HNSW candidate from a legacy flat pair with constant corpus memory.
 * @param {object} options Migration configuration.
 * @returns {Promise<object>} Build evidence suitable for post-build verification.
 */
export async function buildNativeCandidate(options) {
	await requireAbsent(options.outputFile);
	await fsp.mkdir(new URL('.', `file://${options.outputFile}`).pathname, { recursive: true }).catch(() => {});
	const database = createDatabase(options.outputFile);
	let count = 0;
	let peakRss = process.memoryUsage().rss;
	try {
		await database.open();
		await database.createList(database.root, options.listName);
		const list = database.root[options.listName];
		database.vector.enable(list, {
			dimensions: Number(options.dimensions),
			metric: 'cosine',
			reindex: false
		});
		for await (const row of legacyFlatRows(options)) {
			list.push({ ...row.metadata, vec: row.vector });
			count += 1;
			if (count % 32 === 0) {
				await database.waitForIdle();
				peakRss = Math.max(peakRss, process.memoryUsage().rss);
				options.onProgress?.({ count, peakRss });
			}
		}
		await database.waitForIdle();
		database.root.publication = {
			format: 'awtsmoos-rag-native-hnsw-v1',
			corpusId: options.corpusId,
			listName: options.listName,
			dimensions: Number(options.dimensions),
			records: count,
			embeddingModel: options.embeddingModel || '',
			migratedFromLegacyFlat: true
		};
		await database.waitForIdle();
		const audit = database.vector.auditIndex(list);
		if (!audit.ok || audit.registryCount !== count) {
			throw new Error(`native_vector_audit_failed:${audit.registryCount}:${count}`);
		}
		if (!database.verify().ok) throw new Error('native_database_verify_failed');
		return { count, peakRss, audit };
	} finally {
		await database.close();
	}
}
