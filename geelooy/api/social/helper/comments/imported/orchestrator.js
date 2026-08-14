// B"H
const { LruCache } = require('./cache.js');
const { familyFor } = require('./registry.js');
const shard = require('./adapters/shardAdapter.js');
const corpus = require('./adapters/corpusAdapter.js');
const bundle = require('./adapters/bundleAdapter.js');
const legacy = require('./adapters/legacyAdapter.js');
const cache = new LruCache(160);
const adapters = { shard, corpus, bundle, legacy };

function filtered(rows, verseSection, subsectionId) {
	return rows.filter(row => {
		if (verseSection !== '' && String(row.verseSection) !== String(verseSection)) return false;
		if (subsectionId !== '' && String(row.subsectionId) !== String(subsectionId)) return false;
		return true;
	});
}

async function loadImported(context) {
	const family = familyFor(context.seriesId);
	if (!family) return { rows: [], warnings: [], meta: { family: null, sources: {}, cached: false } };
	const key = `${family.id}\0${context.heichelId}\0${context.seriesId}\0${context.postId}`;
	let result = cache.get(key);
	const cached = Boolean(result);
	const started = Date.now();
	if (!result) {
		try { result = await adapters[family.type].load({ ...context, family }); }
		catch (error) { result = { rows: [], warnings: [{ code: 'IMPORTED_SOURCE_FAILED', family: family.id, message: error.message }], sources: {} }; }
		cache.set(key, result);
	}
	const rows = filtered(result.rows || [], context.verseSection, context.subsectionId);
	const alignment = {};
	for (const row of rows) alignment[row.alignment?.status || 'unknown'] = (alignment[row.alignment?.status || 'unknown'] || 0) + 1;
	return { rows, warnings: result.warnings || [], meta: { family: family.id, imported: rows.length, sources: result.sources || {}, alignment, durationMs: Date.now() - started, cached } };
}

module.exports = { loadImported };
