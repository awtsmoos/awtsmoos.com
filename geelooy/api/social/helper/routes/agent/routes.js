// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AgentTranslateRoutes
 * @description
 * Agent-first translation API for Awtsmoos.com, mounted under /api/social.
 * Any AI agent with an API key can: translate source text (scaffold or engine
 * mode, sync / SSE stream / batch job), submit its own translations as native
 * AwtsmoosDB records, list corpora, fetch a post, search the agent translation
 * memory and glossary, and check translation status. Machine-readable first.
 *
 * Auth: X-Awtsmoos-Api-Key header, Bearer token, or ?apiKey=. Create a key
 * while logged in via the existing /api/social/keys endpoints.
 * Idempotency: Idempotency-Key header or idempotencyKey field (24h).
 * Rate limits: translate 20/min, batch 10/min, writes 30/min, reads 120/min.
 */

const { verifyApiKey, apiKeyFromRequest } = require('../../apiKeys.js');
const { er } = require('../../general.js');
const { readPostRecord } = require('../../socialContent.js');
const { postTranslations } = require('../../comments/translations/reader.js');
const { requireMethod, requestValue, limitValue } = require('../packed/requestValues.js');
const engine = require('./engine.js');

function requestHeader($i, name) {
	const headers = $i?.request?.headers || $i?.headers || {};
	const lower = String(name).toLowerCase();
	for (const key of Object.keys(headers)) {
		if (String(key).toLowerCase() === lower) return headers[key];
	}
	return null;
}

async function requireAgent($i) {
	const verified = await verifyApiKey({ $i });
	if (verified && verified.success) {
		const supplied = apiKeyFromRequest($i) || '';
		return { ok: true, userId: verified.success.userId, credentialHash: engine.sha256(supplied) };
	}
	return { ok: false, error: verified };
}

function rateLimited(rl) {
	return er({ code: 'RATE_LIMITED', message: 'Rate limit exceeded.', retryAfterMs: rl.retryAfterMs, limit: rl.limit });
}

function withRateLimit(body, rl) {
	return { ...body, rateLimit: { limit: rl.limit, remaining: rl.remaining, resetMs: rl.resetMs } };
}

class AgentTranslateRoutes {
	constructor($i) {
		this.$i = $i;
		this.idem = engine.createIdempotencyStore($i.db);
		this.jobs = engine.createJobStore($i.db);
		this.submissions = engine.createSubmissionStore($i.db);
	}

	/** Public capability advertisement; no key needed so agents can discover. */
	health() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		return {
			success: {
				service: 'awtsmoos-agent-translate',
				version: 1,
				glossaryVersion: engine.GLOSSARY.version,
				engineMode: process.env.AWTSMOOS_TRANSLATE_ENGINE_URL ? 'engine+scaffold' : 'scaffold',
				endpoints: [
					'POST /agent/translate',
					'POST /agent/translate/stream',
					'POST /agent/translate/batch',
					'GET /agent/translate/job',
					'POST /agent/translate/submit',
					'GET /agent/corpora',
					'GET /agent/post',
					'GET /agent/search',
					'GET /agent/translation-status',
					'GET /agent/glossary'
				],
				auth: 'X-Awtsmoos-Api-Key header, Bearer token, or ?apiKey=',
				limits: { translatePerMin: 20, batchPerMin: 10, writesPerMin: 30, readsPerMin: 120 }
			}
		};
	}

	async translate() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = await requireAgent(this.$i);
		if (!auth.ok) return auth.error;
		const rl = engine.checkRateLimit(auth.credentialHash, 'translate');
		if (!rl.allowed) return rateLimited(rl);
		const idemKey = requestHeader(this.$i, 'idempotency-key') || requestValue(this.$i, 'idempotencyKey', '');
		const replay = await this.idem.lookup(idemKey);
		if (replay) return { success: { ...replay.body, idempotentReplay: true } };
		const text = requestValue(this.$i, 'text', '');
		const mode = requestValue(this.$i, 'mode', 'scaffold');
		const targetLang = requestValue(this.$i, 'targetLang', 'en');
		const result = await engine.translateText(text, { mode, targetLang });
		if (result.error) return er(result.error);
		const body = withRateLimit(result.ok, rl);
		await this.idem.store(idemKey, body);
		return { success: body };
	}

	/** Server-sent events: one event per segment, then a done event. */
	async translateStream() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = await requireAgent(this.$i);
		if (!auth.ok) return auth.error;
		const rl = engine.checkRateLimit(auth.credentialHash, 'translate');
		if (!rl.allowed) return rateLimited(rl);
		const text = requestValue(this.$i, 'text', '');
		const mode = requestValue(this.$i, 'mode', 'scaffold');
		const targetLang = requestValue(this.$i, 'targetLang', 'en');
		const result = await engine.translateText(text, { mode, targetLang });
		if (result.error) return er(result.error);
		const res = this.$i.response;
		res.setHeader('Content-Type', 'text/event-stream');
		res.setHeader('Cache-Control', 'no-cache');
		res.setHeader('Connection', 'keep-alive');
		res.setHeader('Transfer-Encoding', 'chunked');
		const write = obj => res.write(`data: ${JSON.stringify(obj)}\n\n`);
		write({ type: 'start', engine: result.ok.engine, sourceLang: result.ok.sourceLang, segments: result.ok.segments.length });
		for (const seg of result.ok.segments) {
			write({ type: 'segment', index: seg.index, text: seg.text, translation: seg.translation, scaffoldEn: seg.scaffoldEn, glossaryHits: seg.glossaryHits });
		}
		write({ type: 'done', alignment: result.ok.alignment });
		res.end();
	}

	async translateBatch() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = await requireAgent(this.$i);
		if (!auth.ok) return auth.error;
		const rl = engine.checkRateLimit(auth.credentialHash, 'batch');
		if (!rl.allowed) return rateLimited(rl);
		const idemKey = requestHeader(this.$i, 'idempotency-key') || requestValue(this.$i, 'idempotencyKey', '');
		const replay = await this.idem.lookup(idemKey);
		if (replay) return { success: { ...replay.body, idempotentReplay: true } };
		const rawItems = this.$i.$_POST?.items || [];
		const items = Array.isArray(rawItems) ? rawItems.slice(0, engine.MAX_BATCH_ITEMS) : [];
		if (!items.length) return er({ code: 'EMPTY_BATCH', message: 'items[] is required (max 50).' });
		for (const item of items) {
			if (typeof item?.text !== 'string' || !item.text.trim()) {
				return er({ code: 'BAD_ITEM', message: 'Every item needs a text string.' });
			}
		}
		const mode = requestValue(this.$i, 'mode', 'scaffold');
		const targetLang = requestValue(this.$i, 'targetLang', 'en');
		const job = await this.jobs.create(items, { byUserId: auth.userId, mode, targetLang });
		setImmediate(() => engine.processJob(this.$i.db, job, this.jobs).catch(() => {}));
		const body = withRateLimit({ jobId: job.jobId, status: job.status, total: job.total }, rl);
		await this.idem.store(idemKey, body);
		return { success: body };
	}

	async translateJob() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = await requireAgent(this.$i);
		if (!auth.ok) return auth.error;
		const rl = engine.checkRateLimit(auth.credentialHash, 'read');
		if (!rl.allowed) return rateLimited(rl);
		const jobId = requestValue(this.$i, 'id', requestValue(this.$i, 'job', ''));
		if (!jobId) return er({ code: 'MISSING_JOB', message: 'id (job id) is required.' });
		const job = await this.jobs.get(jobId);
		if (!job) return er({ code: 'JOB_NOT_FOUND', message: 'No such job.' });
		return { success: withRateLimit({ jobId: job.jobId, status: job.status, total: job.total, done: job.done, results: job.results || [] }, rl) };
	}

	async translateSubmit() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = await requireAgent(this.$i);
		if (!auth.ok) return auth.error;
		const rl = engine.checkRateLimit(auth.credentialHash, 'write');
		if (!rl.allowed) return rateLimited(rl);
		const idemKey = requestHeader(this.$i, 'idempotency-key') || requestValue(this.$i, 'idempotencyKey', '');
		const replay = await this.idem.lookup(idemKey);
		if (replay) return { success: { ...replay.body, idempotentReplay: true } };
		const segments = this.$i.$_POST?.segments || [];
		const translations = this.$i.$_POST?.translations || [];
		if (!Array.isArray(segments) || !segments.length || !Array.isArray(translations) || translations.length !== segments.length) {
			return er({ code: 'BAD_SUBMISSION', message: 'segments[] and translations[] are required with 1:1 alignment.' });
		}
		const postRef = this.$i.$_POST?.postRef || null;
		const sourceLang = requestValue(this.$i, 'sourceLang', engine.detectLang(segments.map(s => s.text).join(' ')));
		const record = await this.submissions.save({
			byUserId: auth.userId,
			sourceLang,
			targetLang: requestValue(this.$i, 'targetLang', 'en'),
			segments: segments.map((s, i) => ({ index: i, text: String(s.text || s) })),
			translations: translations.map((t, i) => ({ index: i, text: String(t.text || t) })),
			postRef
		});
		const body = withRateLimit({ submissionId: record.submissionId, segmentCount: record.segmentCount, status: record.status }, rl);
		await this.idem.store(idemKey, body);
		return { success: body };
	}

	async corpora() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = await requireAgent(this.$i);
		if (!auth.ok) return auth.error;
		const rl = engine.checkRateLimit(auth.credentialHash, 'read');
		if (!rl.allowed) return rateLimited(rl);
		return { success: withRateLimit({ snapshot: engine.CORPORA.snapshot, corpora: engine.CORPORA.corpora }, rl) };
	}

	async post() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = await requireAgent(this.$i);
		if (!auth.ok) return auth.error;
		const rl = engine.checkRateLimit(auth.credentialHash, 'read');
		if (!rl.allowed) return rateLimited(rl);
		const heichelId = requestValue(this.$i, 'heichel', '');
		const postId = requestValue(this.$i, 'post', requestValue(this.$i, 'id', ''));
		if (!heichelId || !postId) return er({ code: 'MISSING_POST_REF', message: 'heichel and post are required.' });
		const record = await readPostRecord({ $i: this.$i, heichelId, postId });
		if (!record) return er({ code: 'POST_NOT_FOUND', message: 'No such post.' });
		const bodyText = String(record.body || record.text || record.content || '');
		const title = String(record.title || record.name || '');
		return {
			success: withRateLimit({
				postId,
				heichelId,
				title,
				bodyPreview: bodyText.slice(0, 2000),
				bodyChars: bodyText.length,
				truncated: bodyText.length > 2000,
				translationStatus: record.translation_status || record.translationStatus || null,
				translationReviewed: record.translation_reviewed ?? null
			}, rl)
		};
	}

	async search() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = await requireAgent(this.$i);
		if (!auth.ok) return auth.error;
		const rl = engine.checkRateLimit(auth.credentialHash, 'read');
		if (!rl.allowed) return rateLimited(rl);
		const q = requestValue(this.$i, 'q', '');
		const scope = requestValue(this.$i, 'scope', 'all');
		const limit = limitValue(requestValue(this.$i, 'limit'), 20);
		const out = {};
		if (scope === 'all' || scope === 'translations') {
			out.translations = await this.submissions.searchIndex(q, limit);
		}
		if (scope === 'all' || scope === 'glossary') {
			const needle = q.toLowerCase();
			out.glossary = (engine.GLOSSARY.entries || [])
				.filter(e => !q || e.id.toLowerCase().includes(needle) || e.en.toLowerCase().includes(needle) || (e.he || []).some(h => h.includes(q)))
				.slice(0, limit);
		}
		return { success: withRateLimit({ q, scope, ...out }, rl) };
	}

	async translationStatus() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = await requireAgent(this.$i);
		if (!auth.ok) return auth.error;
		const rl = engine.checkRateLimit(auth.credentialHash, 'read');
		if (!rl.allowed) return rateLimited(rl);
		const heichelId = requestValue(this.$i, 'heichel', '');
		const seriesId = requestValue(this.$i, 'series', '');
		const postId = requestValue(this.$i, 'post', '');
		if (!seriesId || !postId) return er({ code: 'MISSING_REF', message: 'series and post are required.' });
		try {
			const report = await postTranslations({ $i: this.$i, heichelId, seriesId, postId });
			return { success: withRateLimit({ translated: Boolean(report.meta?.translated), rows: (report.success || []).length, meta: report.meta || null }, rl) };
		} catch (e) {
			return er({ code: 'STATUS_FAILED', message: String((e && e.message) || e) });
		}
	}

	async glossary() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = await requireAgent(this.$i);
		if (!auth.ok) return auth.error;
		const rl = engine.checkRateLimit(auth.credentialHash, 'read');
		if (!rl.allowed) return rateLimited(rl);
		const termRaw = requestValue(this.$i, 'term', '');
		const term = termRaw.toLowerCase();
		const entries = (engine.GLOSSARY.entries || []).filter(e =>
			!term || e.id.toLowerCase() === term || e.en.toLowerCase() === term || (e.he || []).includes(termRaw)
		);
		return { success: withRateLimit({ version: engine.GLOSSARY.version, entries }, rl) };
	}

	routes() {
		return {
			'/agent/health': this.health.bind(this),
			'/agent/translate': this.translate.bind(this),
			'/agent/translate/stream': this.translateStream.bind(this),
			'/agent/translate/batch': this.translateBatch.bind(this),
			'/agent/translate/job': this.translateJob.bind(this),
			'/agent/translate/submit': this.translateSubmit.bind(this),
			'/agent/corpora': this.corpora.bind(this),
			'/agent/post': this.post.bind(this),
			'/agent/search': this.search.bind(this),
			'/agent/translation-status': this.translationStatus.bind(this),
			'/agent/glossary': this.glossary.bind(this)
		};
	}
}

module.exports = { AgentTranslateRoutes };
