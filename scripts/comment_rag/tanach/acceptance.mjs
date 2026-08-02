// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file acceptance.mjs
 * @description The Awtsmoos tests every published library beside the Tanach light;
 * Awtsmoos.com writes one evidence vessel proving each lane remains whole and right.
 */
import fs from 'node:fs';

const base = String(process.argv[2] || 'http://127.0.0.1:8080').replace(/\/$/, '');
const outputPath = process.argv[3] || '';
const expectedLanes = new Set([
	'likkutei-sichos',
	'sichos-kodesh',
	'sefer-hasichos',
	'meluket',
	'tanach-hebrew-verses'
]);

async function request(pathname, attempts = 1) {
	let lastError;
	for (let attempt = 1; attempt <= attempts; attempt += 1) {
		try {
			const response = await fetch(`${base}${pathname}`, {
				signal: AbortSignal.timeout(180000)
			});
			const body = await response.json();
			if (!response.ok || body.error) {
				throw new Error(JSON.stringify(body.error || body));
			}
			return body.success;
		} catch (error) {
			lastError = error;
			if (attempt < attempts) {
				await new Promise(resolve => setTimeout(resolve, 5000));
			}
		}
	}
	throw lastError;
}

function assertPublic(value, label) {
	if (/\/Users\/|\/mnt\/|dayuhChadash-runtime/.test(JSON.stringify(value))) {
		throw new Error(`private_path_leak:${label}`);
	}
}

async function verifyLane(lane) {
	const query = lane.id === 'tanach-hebrew-verses' ? 'בריאת העולם' : 'תורה';
	const parameters = new URLSearchParams({
		q: query,
		lane: lane.id,
		limit: '2'
	});
	if (lane.textOnly !== true) parameters.set('requireIndexed', 'true');
	const result = await request(`/api/social/search/library/query?${parameters}`, 3);
	if (!Array.isArray(result.hits)) throw new Error(`lane_hits_invalid:${lane.id}`);
	if (lane.textOnly !== true && result.index?.persisted !== true) {
		throw new Error(`lane_index_not_persisted:${lane.id}`);
	}
	assertPublic(result, lane.id);
	return {
		id: lane.id,
		textOnly: lane.textOnly === true,
		mode: result.mode,
		hits: result.hits.length,
		indexed: result.index?.persisted === true,
		embedder: result.embedder?.provider || null
	};
}

const exact = await request('/api/social/search/tanach/hebrew?q=%D7%90%D7%9C%D7%94%D7%99%D7%9D&limit=3');
if (!(exact.verseTotal > 0 && exact.occurrenceTotal >= exact.verseTotal)) {
	throw new Error('exact_totals_invalid');
}
if (!exact.results.every(result => result.matchOffsets.length === result.occurrenceCount)) {
	throw new Error('exact_offsets_invalid');
}
assertPublic(exact, 'exact');

const catalog = await request('/api/social/search/library/shards');
const shards = catalog.shards || catalog;
if (!Array.isArray(shards)) throw new Error('catalog_invalid');
for (const id of expectedLanes) {
	if (!shards.some(shard => shard.id === id)) throw new Error(`lane_missing:${id}`);
}
const laneResults = [];
for (const lane of shards.filter(shard => expectedLanes.has(shard.id))) {
	laneResults.push(await verifyLane(lane));
}
const tanach = laneResults.find(lane => lane.id === 'tanach-hebrew-verses');
if (!tanach?.hits || !String(tanach.embedder).includes('multilingual-e5-small')) {
	throw new Error('tanach_semantic_acceptance_failed');
}
const evidence = {
	BH: 'B"H',
	verifiedAt: new Date().toISOString(),
	base,
	exactVerses: exact.verseTotal,
	exactOccurrences: exact.occurrenceTotal,
	catalogLanes: shards.map(shard => shard.id),
	verifiedLanes: laneResults
};
if (outputPath) fs.writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(evidence, null, 2));
