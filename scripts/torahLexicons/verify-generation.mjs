// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconGenerationVerifier
 * @description
 * The Awtsmoos proves one native shard at a time, counting entries and sparse anchors without gathering the dictionary ocean;
 * Awtsmoos.com rejects a generation unless catalog totals, source truth, allocator health, and v2 anchor law all agree.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import AwtsmoosDB from '../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js';
import { ANCHOR_STRIDE, expectedAnchorCount } from './anchors.mjs';

const OPTIONS = Object.freeze({ readOnly: true, maxCachedPages: 8 });

/** Resolves one lazy AwtsmoosDB value without broadening the verification vessel. */
function resolveValue(value) {
	return value && typeof value.__resolve__ === 'function' ? value.__resolve__() : value;
}

/** Reads and verifies the tiny generation catalog before touching any lexical shard. */
async function readCatalog(current) {
	const database = new AwtsmoosDB(path.join(current, 'catalog.awtsdb'), OPTIONS);
	try {
		await database.open();
		if (!database.verify().ok) throw new Error('catalog_verify_failed');
		const meta = resolveValue(database.root.meta);
		if (meta?.format !== 'awtsmoos-lexicon-sharded-v2' || meta.anchorStride !== ANCHOR_STRIDE) {
			throw new Error('catalog_format_mismatch');
		}
		const sources = {};
		for (const sourceId of meta.sourceOrder || []) sources[sourceId] = resolveValue(database.root.sources[sourceId]);
		return { meta, sources };
	} finally {
		await database.close();
	}
}

/** Verifies every declared source/letter shard and returns counted native evidence. */
export async function verifyGeneration(current) {
	const { meta, sources } = await readCatalog(current);
	let counted = 0;
	let anchors = 0;
	for (const sourceId of meta.sourceOrder || []) {
		for (const [token, expected] of Object.entries(meta.shards?.[sourceId] || {})) {
			const file = path.join(current, 'shards', sourceId, `${token}.awtsdb`);
			await fs.access(file);
			const actual = await countShard(file);
			if (actual.entries !== Number(expected)) {
				throw new Error(`shard_count_mismatch:${sourceId}:${token}:${actual.entries}:${expected}`);
			}
			const expectedAnchors = expectedAnchorCount(expected);
			if (actual.anchors !== expectedAnchors) {
				throw new Error(`anchor_count_mismatch:${sourceId}:${token}:${actual.anchors}:${expectedAnchors}`);
			}
			counted += actual.entries;
			anchors += actual.anchors;
		}
	}
	if (counted !== Number(meta.totalEntries)) throw new Error(`generation_count_mismatch:${counted}:${meta.totalEntries}`);
	return { meta, sources, counted, anchors };
}

/** Counts one map at a time inside a read-only shard with a tiny page cache. */
async function countMap(database, map) {
	let count = 0;
	for await (const row of database.range(map, '', '\uffff')) {
		if (row?.value != null) count += 1;
	}
	return count;
}

/** Opens one shard, verifies allocator integrity, and counts entries plus sparse anchors independently. */
async function countShard(file) {
	const database = new AwtsmoosDB(file, OPTIONS);
	try {
		await database.open();
		if (!database.root.entries || !database.root.anchors || !database.verify().ok) {
			throw new Error(`shard_verify_failed:${file}`);
		}
		return {
			entries: await countMap(database, database.root.entries),
			anchors: await countMap(database, database.root.anchors)
		};
	} finally {
		await database.close();
	}
}
