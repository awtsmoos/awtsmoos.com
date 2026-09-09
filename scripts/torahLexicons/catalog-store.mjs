// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconCatalogStore
 * @description
 * The Awtsmoos gathers tiny source truth, shard counts, and one shared anchor stride into a compact native catalog;
 * Awtsmoos.com preserves provenance and generation law without a JSON manifest while lexical bodies remain in separate AwtsmoosDB vessels.
 */

import path from 'node:path';
import AwtsmoosDB from '../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js';
import { ANCHOR_STRIDE } from './anchors.mjs';

/** Builds one verified v2 catalog for a complete native lexicon generation. */
export async function buildCatalog(candidate, plans, buildReport) {
	const file = path.join(candidate, 'catalog.awtsdb');
	const database = new AwtsmoosDB(file, {
		compression: true,
		maxCachedPages: 8,
		dirtyPageFlushThreshold: 4
	});
	try {
		await database.open();
		database.root.sources = new database.Map();
		for (const plan of plans) await database.root.sources.set(plan.source.id, plan.source);
		database.root.meta = {
			format: 'awtsmoos-lexicon-sharded-v2',
			anchorStride: ANCHOR_STRIDE,
			generatedAt: new Date().toISOString(),
			sourceOrder: plans.map(plan => plan.source.id),
			totalEntries: plans.reduce((sum, plan) => sum + plan.entries, 0),
			shards: Object.fromEntries(plans.map(plan => [plan.source.id, plan.shards])),
			buildPeakWorkerRss: buildReport.peakWorkerRss
		};
		await database.waitForIdle();
		if (!database.verify().ok) throw new Error('catalog_verify_failed');
	} finally {
		await database.close();
	}
	await verifyCatalog(file);
}

/** Reopens the tiny catalog read-only and proves v2 metadata plus source maps survived the write. */
async function verifyCatalog(file) {
	const database = new AwtsmoosDB(file, { readOnly: true, maxCachedPages: 8 });
	try {
		await database.open();
		const meta = database.root.meta?.__resolve__?.() || database.root.meta;
		if (!database.root.sources || !meta || meta.format !== 'awtsmoos-lexicon-sharded-v2' || !database.verify().ok) {
			throw new Error('catalog_readonly_verify_failed');
		}
	} finally {
		await database.close();
	}
}
