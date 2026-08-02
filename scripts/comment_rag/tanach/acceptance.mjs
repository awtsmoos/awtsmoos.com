// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file acceptance.mjs
 * @description The Awtsmoos challenges exact and semantic gates at one chosen host;
 * Awtsmoos.com passes only when Tanach and older lanes both answer without ghosts.
 */
const base = String(process.argv[2] || 'http://127.0.0.1:8080').replace(/\/$/, '');

async function json(pathname, attempts = 1) {
	let last;
	for (let attempt = 1; attempt <= attempts; attempt += 1) {
		try {
			const response = await fetch(`${base}${pathname}`, {
				signal: AbortSignal.timeout(180000)
			});
			const body = await response.json();
			if (!response.ok || body.error) throw new Error(JSON.stringify(body.error || body));
			return body.success;
		} catch (error) {
			last = error;
			if (attempt < attempts) await new Promise(resolve => setTimeout(resolve, 5000));
		}
	}
	throw last;
}

const exact = await json('/api/social/search/tanach/hebrew?q=%D7%90%D7%9C%D7%94%D7%99%D7%9D&limit=3');
if (!(exact.verseTotal > 0 && exact.occurrenceTotal >= exact.verseTotal)) {
	throw new Error('exact_totals_invalid');
}
if (/\/Users\/|\/mnt\//.test(JSON.stringify(exact))) throw new Error('private_path_leak');
if (!exact.results.every(result => result.matchOffsets.length === result.occurrenceCount)) {
	throw new Error('exact_offsets_invalid');
}
const catalog = await json('/api/social/search/library/shards');
const shards = catalog.shards || catalog;
if (!shards.some(shard => shard.id === 'tanach-hebrew-verses')) {
	throw new Error('tanach_lane_missing');
}
const semantic = await json('/api/social/search/library/query?q=%D7%91%D7%A8%D7%99%D7%90%D7%AA%20%D7%94%D7%A2%D7%95%D7%9C%D7%9D&lane=tanach&limit=3', 3);
if (!semantic.hits?.length) throw new Error('tanach_semantic_empty');
if (!String(semantic.embedder?.provider || '').includes('multilingual-e5-small')) {
	throw new Error('tanach_embedder_mismatch');
}
const existing = shards.find(shard => shard.id !== 'tanach-hebrew-verses');
if (!existing) throw new Error('existing_lane_missing');
const legacy = await json(`/api/social/search/library/query?q=creation&lane=${encodeURIComponent(existing.id)}&limit=1`, 2);
if (!Array.isArray(legacy.hits)) throw new Error('existing_lane_broken');
console.log(JSON.stringify({
	BH: 'B"H',
	base,
	exactVerses: exact.verseTotal,
	exactOccurrences: exact.occurrenceTotal,
	semanticHits: semantic.hits.length,
	existingLane: existing.id
}, null, 2));
