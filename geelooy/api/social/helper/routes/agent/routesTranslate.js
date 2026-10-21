//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AgentTranslateRoutesTranslate
 * @description
 * Prototype-mixin sibling of AgentTranslateRoutes: translate, stream and batch methods, relocated verbatim.
 */

const { er } = require('../../general.js');
const { requireMethod, requestValue } = require('../packed/requestValues.js');
const engine = require('./engine.js');
const { requestHeader, requireAgent, rateLimited, withRateLimit } = require('./routesHelpers.js');

module.exports = {
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
	},

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
	},

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
	},
};
