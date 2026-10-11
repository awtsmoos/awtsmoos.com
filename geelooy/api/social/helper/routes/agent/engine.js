// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AgentTranslateEngine
 * @description
 * Agent-first translation engine for Awtsmoos.com. It segments Hebrew/Aramaic
 * source text, applies the bundled prescribed glossary deterministically, and
 * produces machine-readable translation envelopes (segments, alignment,
 * glossary hits). The calling AI agent supplies the prose: either through a
 * configured engine relay (AWTSMOOS_TRANSLATE_ENGINE_URL) or by translating
 * scaffold segments itself and submitting via /agent/translate/submit.
 *
 * Nothing here touches existing behavior; it only reads $i.db for job and
 * idempotency persistence. No external libraries; node builtins only.
 */

const crypto = require('node:crypto');
const path = require('node:path');
const fs = require('node:fs');

const GLOSSARY = JSON.parse(fs.readFileSync(path.join(__dirname, 'glossary.json'), 'utf8'));
const CORPORA = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpora.json'), 'utf8'));

const HEBREW_RE = /[\u0590-\u05FF]/;
const ARAMAIC_RE = /[\u0600-\u06FF]/;
const SEGMENT_SPLIT_RE = /([׃.!?;\n]+)/u;

const MAX_TEXT_CHARS = 50000;
const MAX_SEGMENTS = 200;
const MAX_BATCH_ITEMS = 50;
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

function sha256(text) {
	return crypto.createHash('sha256').update(String(text), 'utf8').digest('hex');
}

function randomId(prefix) {
	return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(6).toString('hex')}`;
}

/** Detects the dominant script of a text: he, ar, or mixed. */
function detectLang(text) {
	const hebrew = HEBREW_RE.test(text);
	const arabic = ARAMAIC_RE.test(text);
	if (hebrew && arabic) return 'mixed';
	if (arabic) return 'ar';
	if (hebrew) return 'he';
	return 'unknown';
}

/**
 * Splits source text into bounded segments on sentence/verse boundaries.
 * Returns { segments, sourceLang } where each segment carries its char range.
 */
function segmentText(text) {
	const source = String(text || '');
	if (!source) return { segments: [], sourceLang: 'unknown' };
	const sourceLang = detectLang(source);
	const parts = source.split(SEGMENT_SPLIT_RE);
	const segments = [];
	let offset = 0;
	let buffer = '';
	let bufferStart = 0;
	function flush() {
		const trimmed = buffer.trim();
		if (trimmed) {
			segments.push({
				index: segments.length,
				text: trimmed,
				lang: detectLang(trimmed),
				charRange: [bufferStart + (buffer.length - buffer.trimStart().length), bufferStart + buffer.length - (buffer.length - buffer.trimEnd().length)]
			});
		}
		buffer = '';
	}
	for (const part of parts) {
		if (!part) continue;
		if (SEGMENT_SPLIT_RE.test(part) || part === '\n') {
			buffer += part;
			bufferStart = offset;
			flush();
		} else {
			if (!buffer) bufferStart = offset;
			buffer += part;
		}
		offset += part.length;
	}
	if (buffer.trim()) flush();
	return { segments: segments.slice(0, MAX_SEGMENTS), sourceLang, truncated: segments.length > MAX_SEGMENTS };
}

/**
 * Applies the bundled glossary to segments. Records every hit with its
 * position and produces scaffoldEn: the segment text with matched Hebrew
 * terms replaced by their prescribed English.
 */
function applyGlossary(segments, glossary = GLOSSARY) {
	const forms = [];
	for (const entry of glossary.entries || []) {
		for (const he of entry.he || []) {
			forms.push({ he, en: entry.en, id: entry.id, len: he.length });
		}
	}
	forms.sort((a, b) => b.len - a.len);
	return segments.map(seg => {
		const hits = [];
		const claimed = [];
		for (const form of forms) {
			let from = 0;
			for (;;) {
				const at = seg.text.indexOf(form.he, from);
				if (at < 0) break;
				const overlaps = claimed.some(([s, e]) => at < e && at + form.len > s);
				if (!overlaps) {
					hits.push({ term: form.id, he: form.he, en: form.en, start: at, end: at + form.len });
					claimed.push([at, at + form.len]);
				}
				from = at + form.len;
			}
		}
		hits.sort((a, b) => a.start - b.start);
		let scaffoldEn = seg.text;
		for (const hit of [...hits].sort((a, b) => b.start - a.start)) {
			scaffoldEn = scaffoldEn.slice(0, hit.start) + hit.en + scaffoldEn.slice(hit.end);
		}
		return { ...seg, glossaryHits: hits, scaffoldEn };
	});
}

/**
 * Runs the translation pipeline for one text. Mode "engine" requires
 * AWTSMOOS_TRANSLATE_ENGINE_URL; otherwise scaffold mode applies the
 * glossary and returns segments for the calling agent to translate.
 */
async function translateText(text, { mode = 'scaffold', targetLang = 'en', fetchImpl = globalThis.fetch } = {}) {
	if (typeof text !== 'string' || !text.trim()) {
		return { error: { code: 'EMPTY_TEXT', message: 'text is required.' } };
	}
	if (text.length > MAX_TEXT_CHARS) {
		return { error: { code: 'TEXT_TOO_LARGE', message: `text exceeds ${MAX_TEXT_CHARS} characters.` } };
	}
	const { segments, sourceLang, truncated } = segmentText(text);
	const glossed = applyGlossary(segments);
	if (mode === 'engine') {
		const engineUrl = process.env.AWTSMOOS_TRANSLATE_ENGINE_URL;
		if (!engineUrl) {
			return { error: { code: 'NO_ENGINE', message: 'AWTSMOOS_TRANSLATE_ENGINE_URL is unset; use mode "scaffold".' } };
		}
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), 120000);
		try {
			const response = await fetchImpl(engineUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				signal: controller.signal,
				body: JSON.stringify({ segments: glossed.map(s => ({ index: s.index, text: s.text })), sourceLang, targetLang, glossary: GLOSSARY.version })
			});
			const body = await response.json().catch(() => null);
			if (!response.ok || !body || !Array.isArray(body.translations)) {
				return { error: { code: 'ENGINE_FAILED', message: 'Translation engine returned an unusable response.' } };
			}
			const byIndex = new Map(body.translations.map(t => [t.index, String(t.text || '')]));
			const out = glossed.map(s => ({ ...s, translation: byIndex.has(s.index) ? byIndex.get(s.index) : null }));
			return { ok: { engine: 'engine', sourceLang, targetLang, truncated, segments: out, alignment: out.map(s => ({ sourceIndex: s.index, targetIndex: s.translation == null ? null : s.index })) } };
		} catch (e) {
			return { error: { code: 'ENGINE_ERROR', message: String((e && e.message) || e) } };
		} finally {
			clearTimeout(timer);
		}
	}
	const out = glossed.map(s => ({ ...s, translation: null }));
	return {
		ok: {
			engine: 'scaffold',
			sourceLang,
			targetLang,
			truncated,
			segments: out,
			alignment: out.map(s => ({ sourceIndex: s.index, targetIndex: null })),
			note: 'Scaffold mode: glossary applied, prose translation left to the calling agent. POST the finished translation to /agent/translate/submit.'
		}
	};
}

// ---------------------------------------------------------------------------
// Rate limiting (in-process token buckets per credential hash + endpoint kind)
// ---------------------------------------------------------------------------

const RATE_LIMITS = {
	translate: { limit: 20, windowMs: 60000 },
	batch: { limit: 10, windowMs: 60000 },
	read: { limit: 120, windowMs: 60000 },
	write: { limit: 30, windowMs: 60000 }
};
const buckets = new Map();

function checkRateLimit(credentialHash, kind) {
	const spec = RATE_LIMITS[kind] || RATE_LIMITS.read;
	const now = Date.now();
	const key = `${credentialHash}:${kind}`;
	let bucket = buckets.get(key);
	if (!bucket || now >= bucket.resetAt) {
		bucket = { count: 0, resetAt: now + spec.windowMs };
		buckets.set(key, bucket);
	}
	bucket.count += 1;
	const remaining = Math.max(0, spec.limit - bucket.count);
	return {
		allowed: bucket.count <= spec.limit,
		limit: spec.limit,
		remaining,
		resetMs: bucket.resetAt - now,
		retryAfterMs: bucket.count <= spec.limit ? 0 : bucket.resetAt - now
	};
}

// ---------------------------------------------------------------------------
// Idempotency (AwtsmoosDB-backed, 24h TTL)
// ---------------------------------------------------------------------------

const IDEMPOTENCY_BASE = '/ikar/agentApi/idempotency';

function createIdempotencyStore(db) {
	async function lookup(key) {
		if (!key) return null;
		const record = await db.get(`${IDEMPOTENCY_BASE}/${sha256(key)}`).catch(() => null);
		if (!record || typeof record !== 'object') return null;
		if (Date.now() - (record.createdAt || 0) > IDEMPOTENCY_TTL_MS) return null;
		return record;
	}
	async function store(key, body) {
		if (!key) return;
		await db.write(`${IDEMPOTENCY_BASE}/${sha256(key)}`, { body, createdAt: Date.now() }).catch(() => {});
	}
	return { lookup, store };
}

// ---------------------------------------------------------------------------
// Jobs (AwtsmoosDB-backed batch translation jobs)
// ---------------------------------------------------------------------------

const JOBS_BASE = '/ikar/agentApi/jobs';

function createJobStore(db) {
	async function create(items, opts = {}) {
		const jobId = randomId('agentjob');
		const job = {
			jobId,
			status: 'queued',
			createdAt: Date.now(),
			updatedAt: Date.now(),
			byUserId: opts.byUserId || null,
			mode: opts.mode || 'scaffold',
			targetLang: opts.targetLang || 'en',
			total: items.length,
			done: 0,
			items: items.map((item, i) => ({ key: item.key || `item-${i}`, text: item.text })),
			results: []
		};
		await db.write(`${JOBS_BASE}/${jobId}`, job);
		return job;
	}
	async function get(jobId) {
		return db.get(`${JOBS_BASE}/${String(jobId)}`).catch(() => null);
	}
	async function update(job) {
		job.updatedAt = Date.now();
		await db.write(`${JOBS_BASE}/${job.jobId}`, job).catch(() => {});
		return job;
	}
	return { create, get, update };
}

/** Processes a batch job's items through the pipeline with bounded pacing. */
async function processJob(db, job, jobStore) {
	job.status = 'processing';
	await jobStore.update(job);
	for (let i = 0; i < job.items.length; i++) {
		const item = job.items[i];
		try {
			const result = await translateText(item.text, { mode: job.mode, targetLang: job.targetLang });
			job.results.push({ key: item.key, ok: !result.error, ...(result.ok || { error: result.error }) });
		} catch (e) {
			job.results.push({ key: item.key, ok: false, error: { code: 'ITEM_FAILED', message: String((e && e.message) || e) } });
		}
		job.done = i + 1;
		await jobStore.update(job);
	}
	job.status = 'done';
	await jobStore.update(job);
	return job;
}

// ---------------------------------------------------------------------------
// Submissions (agent-produced translations, native AwtsmoosDB records)
// ---------------------------------------------------------------------------

const SUBMISSIONS_BASE = '/ikar/agentApi/submissions';

function createSubmissionStore(db) {
	async function save({ byUserId, sourceLang, targetLang, segments, translations, postRef }) {
		const submissionId = randomId('agentsub');
		const record = {
			submissionId,
			createdAt: Date.now(),
			byUserId: byUserId || null,
			sourceLang: sourceLang || 'he',
			targetLang: targetLang || 'en',
			segmentCount: segments.length,
			segments,
			translations,
			postRef: postRef || null,
			status: 'submitted'
		};
		await db.write(`${SUBMISSIONS_BASE}/${submissionId}`, record);
		const index = (await db.get(`${SUBMISSIONS_BASE}/_index`).catch(() => null)) || [];
		index.push({ submissionId, createdAt: record.createdAt, preview: String(segments[0]?.text || '').slice(0, 120), postRef: record.postRef });
		await db.write(`${SUBMISSIONS_BASE}/_index`, index.slice(-500)).catch(() => {});
		return record;
	}
	async function searchIndex(query, limit = 20) {
		const q = String(query || '').toLowerCase();
		const index = (await db.get(`${SUBMISSIONS_BASE}/_index`).catch(() => null)) || [];
		return index.filter(e => !q || String(e.preview || '').toLowerCase().includes(q)).slice(-limit).reverse();
	}
	return { save, searchIndex };
}

module.exports = {
	GLOSSARY,
	CORPORA,
	MAX_TEXT_CHARS,
	MAX_SEGMENTS,
	MAX_BATCH_ITEMS,
	detectLang,
	segmentText,
	applyGlossary,
	translateText,
	checkRateLimit,
	createIdempotencyStore,
	createJobStore,
	processJob,
	createSubmissionStore,
	sha256,
	randomId
};
