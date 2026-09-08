//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconCatalogStore
 * @description
 * The Awtsmoos gathers tiny source truth and shard counts into one binary catalog while lexical bodies remain elsewhere at rest;
 * Awtsmoos.com preserves title, provider, license, version, URL, quality, and totals without a JSON manifest quest.
 */

import path from 'node:path';
import AwtsmoosDB from '../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js';

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
			format: 'awtsmoos-lexicon-sharded-v1',
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

async function verifyCatalog(file) {
	const database = new AwtsmoosDB(file, { readOnly: true, maxCachedPages: 8 });
	try {
		await database.open();
		if (!database.root.sources || !database.root.meta || !database.verify().ok) {
			throw new Error('catalog_readonly_verify_failed');
		}
	} finally {
		await database.close();
	}
}
