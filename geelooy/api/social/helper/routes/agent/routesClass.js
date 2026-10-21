//B"H
//Blessed is He
//Boruch Hashem

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

const { requireMethod } = require('../packed/requestValues.js');
const engine = require('./engine.js');

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
					'GET /agent/glossary',
					'POST /agent/posts/create',
					'POST /agent/posts/edit',
					'POST /agent/posts/delete',
					'POST /agent/posts/import',
					'GET /agent/posts/list',
					'POST /agent/heichelos/create',
					'POST /agent/heichelos/edit',
					'POST /agent/heichelos/delete',
					'GET /agent/heichelos/list'
				],
				auth: 'X-Awtsmoos-Api-Key header, Bearer token, or ?apiKey=',
				limits: { translatePerMin: 20, batchPerMin: 10, writesPerMin: 30, readsPerMin: 120 }
			}
		};
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
			'/agent/glossary': this.glossary.bind(this),
			'/agent/posts/create': this.postCreate.bind(this),
			'/agent/posts/edit': this.postEdit.bind(this),
			'/agent/posts/delete': this.postDelete.bind(this),
			'/agent/posts/import': this.postImport.bind(this),
			'/agent/posts/list': this.postList.bind(this),
			'/agent/heichelos/create': this.heichelCreate.bind(this),
			'/agent/heichelos/edit': this.heichelEdit.bind(this),
			'/agent/heichelos/delete': this.heichelDelete.bind(this),
			'/agent/heichelos/list': this.heichelList.bind(this)
		};
	}
}

module.exports = { AgentTranslateRoutes };
