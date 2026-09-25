// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PendingCommentVectors
 * @description
 * Prompt vector indexing for newly imported Chassidus comments (translations,
 * summaries, OCR-driven re-imports) — the bridge between the bulk import API
 * and the next full RAG publication build.
 *
 * WHY THIS EXISTS:
 * Semantic search (geelooy/api/social/helper/search/rag) ranks against
 * prebuilt immutable publication shards (HNSW / flat-f32 matrices). A comment
 * imported today is invisible to vector search until someone rebuilds and
 * republishes a full corpus generation — historically hours to days later.
 * This module keeps a small append-only "pending" vector store for freshly
 * imported rows so they become semantically searchable within minutes.
 *
 * WIRING (for the bulk import API — 3 lines, fire-and-forget safe):
 *
 *   const { noteImportedComments } = require('../search/rag/pendingCommentVectors.js');
 *   // ... after a batch of comment rows is durably written:
 *   noteImportedComments({ $i, rows: writtenRows }).catch(err =>
 *     console.error('[pendingVectors] background index failed:', err.code || err.message));
 *
 * Each row needs: { aliasId, seriesId, postId, verseSection?, subSection?,
 * commentId?, readable?|text?|previewEnglish? }. Rows already indexed (by
 * commentId/coordinate key) are skipped, so re-running a batch is safe.
 *
 * QUERY-TIME MERGE (for the search owner — merges pending hits with shard hits):
 *
 *   const { searchPendingVectors, mergePendingHits } = require('./pendingCommentVectors.js');
 *   const pending = await searchPendingVectors({ $i, queryVector: embedding.vector, limit });
 *   const hits = mergePendingHits(shardHits, pending, limit);
 *
 * Pending hits carry live comment coordinates (aliasId/seriesId/postId/
 * verseSection/subSection/commentId) so the existing hydration path
 * (hydrate.js -> joinComments) resolves them from the live database —
 * exactly like shard hits. `drainPendingVectors({ $i })` clears the store
 * after a full publication rebuild absorbs the rows.
 *
 * RESOURCE BOUNDS: the store is capped (default 100k rows, FIFO eviction of
 * the oldest) so an unbounded import cannot grow it without limit; the cap is
 * configurable via PENDING_VECTOR_MAX_ROWS. Embedding runs through the
 * existing persistent multilingual worker (intfloat/multilingual-e5-small,
 * 384 dims) with bounded concurrency and never blocks the import request.
 */

const fs = require('node:fs');
const path = require('node:path');
const { cosine, closeness } = require('./math.js');

const STORE_FILE_NAME = 'pending-comment-vectors.jsonl';
const EMBED_CONCURRENCY = 8;
const MAX_TEXT_CHARS = 4000;
const DEFAULT_MAX_ROWS = 100000;
const VECTOR_DIMENSIONS = 384;

function maxRows() {
	const configured = Number(process.env.PENDING_VECTOR_MAX_ROWS || DEFAULT_MAX_ROWS);
	return Number.isFinite(configured) && configured > 0 ? Math.floor(configured) : DEFAULT_MAX_ROWS;
}

/** Lazily requires the embedder so importing this module never wakes the worker. */
function embedder() {
	return require('./multilingualEmbedder.js');
}

function codedError(code, message) {
	return Object.assign(new Error(message), { code });
}

/** Resolves the pending-store file next to the RAG publication catalog. */
function storePathFor($i) {
	try {
		const { publicationCatalogPath } = require('./publicationCatalogPaths.js');
		const catalogFile = publicationCatalogPath($i);
		if (catalogFile) return path.join(path.dirname(catalogFile), STORE_FILE_NAME);
	} catch {}
	return null;
}

function present(value) {
	return value !== undefined && value !== null && String(value).trim() !== '';
}

/** Stable identity for one comment row: commentId wins, else coordinates. */
function recordKey(row = {}) {
	if (present(row.commentId)) return `id:${row.commentId}`;
	return [
		'coord',
		row.aliasId || '',
		row.seriesId || '',
		row.postId || '',
		row.verseSection ?? '',
		row.subSection ?? row.subsectionId ?? ''
	].join('‖');
}

/** Picks the English text worth embedding from a translation/summary row. */
function extractText(row = {}) {
	const candidates = [
		row.readable,
		row.text,
		row.previewEnglish,
		row.sampleContent,
		row.content,
		row.summary,
		row.headline
	];
	for (const candidate of candidates) {
		if (typeof candidate === 'string' && candidate.trim()) {
			return candidate.trim().slice(0, MAX_TEXT_CHARS);
		}
		if (candidate && typeof candidate === 'object') {
			const nested = extractText(candidate);
			if (nested) return nested;
		}
	}
	return '';
}

function normalizeRow(row = {}, aliasFallback = '') {
	const text = extractText(row);
	if (!text) return null;
	return {
		key: recordKey(row),
		commentId: present(row.commentId) ? String(row.commentId) : null,
		aliasId: String(row.aliasId || aliasFallback || ''),
		seriesId: String(row.seriesId || ''),
		postId: String(row.postId || ''),
		verseSection: row.verseSection ?? '',
		subSection: row.subSection ?? row.subsectionId ?? '',
		text
	};
}

/** Per-process store registry keyed by store file path ('' = memory-only). */
const stores = new Map();

function getStore($i) {
	const file = storePathFor($i);
	const key = file || '';
	let store = stores.get(key);
	if (!store) {
		store = {
			file,
			records: new Map(),
			order: [],
			loaded: false,
			persisted: Boolean(file),
			queue: [],
			queuedKeys: new Set(),
			draining: null
		};
		stores.set(key, store);
	}
	return store;
}

/** Loads persisted JSONL rows into memory (once per process). */
function loadStore(store) {
	if (store.loaded) return;
	store.loaded = true;
	if (!store.file) return;
	let content = '';
	try {
		content = fs.readFileSync(store.file, 'utf8');
	} catch {
		return;
	}
	for (const line of content.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed) continue;
		try {
			const record = JSON.parse(trimmed);
			if (!record || !record.key || !Array.isArray(record.vector)) continue;
			if (store.records.has(record.key)) continue;
			store.records.set(record.key, {
				...record,
				vector: Float32Array.from(record.vector)
			});
			store.order.push(record.key);
		} catch {}
	}
	enforceCap(store);
}

function persistRecord(store, record) {
	if (!store.file) return;
	try {
		fs.mkdirSync(path.dirname(store.file), { recursive: true });
		fs.appendFileSync(store.file, JSON.stringify({
			key: record.key,
			commentId: record.commentId,
			aliasId: record.aliasId,
			seriesId: record.seriesId,
			postId: record.postId,
			verseSection: record.verseSection,
			subSection: record.subSection,
			vector: Array.from(record.vector, value => Number(value.toFixed(5))),
			indexedAt: record.indexedAt
		}) + '\n');
	} catch (error) {
		store.persisted = false;
		store.persistError = error.code || error.message;
	}
}

/** FIFO-evicts oldest rows when the store exceeds its cap. */
function enforceCap(store) {
	const cap = maxRows();
	while (store.order.length > cap) {
		const oldest = store.order.shift();
		store.records.delete(oldest);
	}
}

function addRecord(store, record) {
	if (store.records.has(record.key)) return false;
	store.records.set(record.key, record);
	store.order.push(record.key);
	enforceCap(store);
	persistRecord(store, record);
	return true;
}

async function embedOne(text) {
	const { embedMultilingualQuery } = embedder();
	const result = await embedMultilingualQuery(text);
	const vector = result && result.vector;
	if (!Array.isArray(vector) || vector.length !== VECTOR_DIMENSIONS) {
		throw codedError('PENDING_VECTOR_INVALID', 'Embedder did not return a 384-dim vector.');
	}
	return Float32Array.from(vector);
}

/** Drains the embedding queue with bounded concurrency. */
async function drainQueue(store) {
	if (store.draining) return store.draining;
	store.draining = (async () => {
		const stats = { embedded: 0, failed: 0, skipped: 0 };
		const workers = [];
		const next = async () => {
			while (store.queue.length) {
				const record = store.queue.shift();
				store.queuedKeys.delete(record.key);
				if (store.records.has(record.key)) {
					stats.skipped += 1;
					continue;
				}
				try {
					const vector = await embedOne(record.text);
					const stored = { ...record, vector, indexedAt: new Date().toISOString() };
					delete stored.text;
					if (addRecord(store, stored)) stats.embedded += 1;
					else stats.skipped += 1;
				} catch {
					stats.failed += 1;
				}
			}
		};
		for (let i = 0; i < EMBED_CONCURRENCY; i += 1) workers.push(next());
		await Promise.all(workers);
		return stats;
	})();
	try {
		return await store.draining;
	} finally {
		store.draining = null;
	}
}

/**
 * Indexes freshly imported comment rows for prompt semantic search.
 * Safe to call without awaiting — the queue drains in the background and
 * per-row failures never reject the batch. Idempotent by record key.
 */
async function noteImportedComments({ $i, rows = [], aliasId = '' } = {}) {
	const store = getStore($i);
	loadStore(store);
	const list = Array.isArray(rows) ? rows : [rows];
	let queued = 0;
	let skipped = 0;
	for (const raw of list) {
		const record = normalizeRow(raw, aliasId);
		if (!record) {
			skipped += 1;
			continue;
		}
		if (store.records.has(record.key) || store.queuedKeys.has(record.key)) {
			skipped += 1;
			continue;
		}
		store.queue.push(record);
		store.queuedKeys.add(record.key);
		queued += 1;
	}
	const drained = await drainQueue(store);
	return { queued, skipped: skipped + drained.skipped, embedded: drained.embedded, failed: drained.failed };
}

/**
 * Searches pending vectors for one query vector. Returns hits shaped like
 * shard hits ({ rank, score, percent, row }) with live comment coordinates
 * for the existing hydration path.
 */
async function searchPendingVectors({ $i, queryVector, limit = 10, aliasIds = null } = {}) {
	const store = getStore($i);
	loadStore(store);
	if (!Array.isArray(queryVector) || !queryVector.length) {
		throw codedError('PENDING_VECTOR_QUERY_MISSING', 'A query vector is required.');
	}
	const wanted = Number(limit) > 0 ? Math.floor(Number(limit)) : 10;
	const aliasSet = Array.isArray(aliasIds) && aliasIds.length
		? new Set(aliasIds.map(String))
		: null;
	const scored = [];
	for (const record of store.records.values()) {
		if (aliasSet && record.aliasId && !aliasSet.has(record.aliasId)) continue;
		const score = cosine(queryVector, record.vector);
		if (!Number.isFinite(score)) continue;
		scored.push({ record, score });
	}
	scored.sort((a, b) => b.score - a.score);
	return scored.slice(0, wanted).map((item, index) => ({
		rank: index + 1,
		score: Number(item.score.toFixed(6)),
		percent: closeness(item.score),
		row: {
			commentId: item.record.commentId,
			aliasId: item.record.aliasId,
			seriesId: item.record.seriesId,
			postId: item.record.postId,
			verseSection: item.record.verseSection,
			subSection: item.record.subSection,
			pendingVector: true,
			vectorSource: 'pending-comment-vectors',
			indexedAt: item.record.indexedAt
		}
	}));
}

/**
 * Merges pending hits with immutable shard hits, sorted by score.
 * Pending hits keep their coordinates; provenance stays visible via
 * row.pendingVector / row.vectorSource.
 */
function mergePendingHits(baseHits = [], pendingHits = [], limit = 10) {
	const wanted = Number(limit) > 0 ? Math.floor(Number(limit)) : 10;
	const combined = [...(baseHits || []), ...(pendingHits || [])]
		.filter(Boolean)
		.sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
		.slice(0, wanted);
	return combined.map((hit, index) => ({ ...hit, rank: index + 1 }));
}

/** Observability for operators: size, persistence, queue depth. */
async function pendingIndexStats({ $i } = {}) {
	const store = getStore($i);
	loadStore(store);
	return {
		records: store.records.size,
		queued: store.queue.length,
		draining: Boolean(store.draining),
		persisted: store.persisted,
		persistError: store.persistError || null,
		storeFile: store.file || null,
		maxRows: maxRows(),
		model: 'intfloat/multilingual-e5-small',
		dimensions: VECTOR_DIMENSIONS
	};
}

/**
 * Clears the pending store after a full RAG publication rebuild has absorbed
 * the rows. Returns the number of cleared records.
 */
async function drainPendingVectors({ $i } = {}) {
	const store = getStore($i);
	loadStore(store);
	const cleared = store.records.size;
	store.records.clear();
	store.order.length = 0;
	if (store.file) {
		try {
			fs.writeFileSync(store.file, '');
		} catch {}
	}
	return { cleared };
}

module.exports = {
	EMBED_CONCURRENCY,
	VECTOR_DIMENSIONS,
	drainPendingVectors,
	mergePendingHits,
	noteImportedComments,
	pendingIndexStats,
	searchPendingVectors,
	storePathFor
};
