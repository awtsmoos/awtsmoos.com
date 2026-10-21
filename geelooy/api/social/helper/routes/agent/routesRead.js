//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AgentTranslateRoutesRead
 * @description
 * Prototype-mixin sibling of AgentTranslateRoutes: corpora, post, search, status and glossary methods, relocated verbatim.
 */

const { er } = require('../../general.js');
const { readPostRecord } = require('../../socialContent.js');
const { postTranslations } = require('../../comments/translations/reader.js');
const { requireMethod, requestValue, limitValue } = require('../packed/requestValues.js');
const engine = require('./engine.js');
const { requireAgent, rateLimited, withRateLimit } = require('./routesHelpers.js');

module.exports = {
	async corpora() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = await requireAgent(this.$i);
		if (!auth.ok) return auth.error;
		const rl = engine.checkRateLimit(auth.credentialHash, 'read');
		if (!rl.allowed) return rateLimited(rl);
		return { success: withRateLimit({ snapshot: engine.CORPORA.snapshot, corpora: engine.CORPORA.corpora }, rl) };
	},

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
	},

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
	},

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
	},

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
	},
};
