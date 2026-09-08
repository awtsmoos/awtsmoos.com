//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconGenerationVerifier
 * @description
 * The Awtsmoos proves one shard at a time so verification itself never gathers the dictionary ocean into RAM;
 * Awtsmoos.com compares catalog counts, binary allocator truth, source provenance, and lexical totals before release can.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import AwtsmoosDB from '../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js';

const OPTIONS = Object.freeze({ readOnly: true, maxCachedPages: 8 });

function resolveValue(value) {
	return value && typeof value.__resolve__ === 'function' ? value.__resolve__() : value;
}

export async function verifyGeneration(current) {
	const catalog = new AwtsmoosDB(path.join(current, 'catalog.awtsdb'), OPTIONS);
	let meta;
	const sources = {};
	try {
		await catalog.open();
		if (!catalog.verify().ok) throw new Error('catalog_verify_failed');
		meta = resolveValue(catalog.root.meta);
		for (const sourceId of meta.sourceOrder || []) {
			sources[sourceId] = resolveValue(catalog.root.sources[sourceId]);
		}
	} finally {
		await catalog.close();
	}
	let counted = 0;
	for (const sourceId of meta.sourceOrder || []) {
		for (const [token, expected] of Object.entries(meta.shards?.[sourceId] || {})) {
			const file = path.join(current, 'shards', sourceId, `${token}.awtsdb`);
			await fs.access(file);
			const actual = await countShard(file);
			if (actual !== Number(expected)) throw new Error(`shard_count_mismatch:${sourceId}:${token}:${actual}:${expected}`);
			counted += actual;
		}
	}
	if (counted !== Number(meta.totalEntries)) throw new Error(`generation_count_mismatch:${counted}:${meta.totalEntries}`);
	return { meta, sources, counted };
}

async function countShard(file) {
	const database = new AwtsmoosDB(file, OPTIONS);
	let count = 0;
	try {
		await database.open();
		if (!database.root.entries || !database.verify().ok) throw new Error(`shard_verify_failed:${file}`);
		for await (const row of database.range(database.root.entries, '', '\uffff')) {
			if (row?.value != null) count += 1;
		}
		return count;
	} finally {
		await database.close();
	}
}
