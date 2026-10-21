//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AgentTranslateRoutesJobSubmit
 * @description
 * Prototype-mixin sibling of AgentTranslateRoutes: job and submit methods, relocated verbatim.
 */

const { er } = require('../../general.js');
const { requireMethod, requestValue } = require('../packed/requestValues.js');
const engine = require('./engine.js');
const { requestHeader, requireAgent, rateLimited, withRateLimit } = require('./routesHelpers.js');

module.exports = {
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
	},

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
	},
};
