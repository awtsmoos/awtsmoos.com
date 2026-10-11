// B"H
// Local verification for the agent translation API. Mocks $i with an
// in-memory AwtsmoosDB and exercises every endpoint end to end.
// Run: node geelooy/api/social/helper/routes/agent/test/agentApi.test.cjs
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { AgentTranslateRoutes } = require('../routes.js');

function makeDb() {
	const map = new Map();
	return {
		_map: map,
		get: async p => {
			if (!map.has(p)) throw new Error('not found: ' + p);
			return map.get(p);
		},
		write: async (p, v) => {
			map.set(p, v);
			return { ok: true };
		}
	};
}

function makeI(db, { method = 'GET', get = {}, post = {}, headers = {} } = {}) {
	const writes = [];
	return {
		$i: null,
		request: { method, headers },
		$_GET: get,
		$_POST: post,
		$_QUERY: {},
		db,
		response: {
			headers: {},
			setHeader(k, v) { this.headers[k] = v; },
			write(chunk) { writes.push(String(chunk)); },
			end() { this.ended = true; },
			_writes: writes
		}
	};
}

async function main() {
	const db = makeDb();
	const secret = 'awt_test_' + crypto.randomBytes(12).toString('hex');
	const hash = crypto.createHash('sha256').update(secret).digest('hex');
	await db.write('/social/apiKeys/byHash/' + hash, { userId: 'agent1', keyId: 'k1' });
	await db.write('/social/users/agent1/apiKeys/k1', { id: 'k1', hash, createdAt: Date.now(), revokedAt: null });
	const authed = (extra = {}) => makeI(db, { method: 'POST', post: { apiKey: secret, ...extra.post }, get: extra.get || {}, headers: extra.headers || {} });

	// 1. health is public
	{
		const r = new AgentTranslateRoutes(makeI(db));
		const out = await r.routes()['/agent/health']();
		assert.ok(out.success, 'health success');
		assert.equal(out.success.service, 'awtsmoos-agent-translate');
		assert.ok(out.success.endpoints.length >= 10, 'endpoint list');
		console.log('ok 1 - health public');
	}

	// 2. auth enforced
	{
		const r = new AgentTranslateRoutes(makeI(db, { method: 'POST', post: { text: 'שלום' } }));
		const out = await r.routes()['/agent/translate']();
		assert.ok(out.error && out.error.code === 'NO_API_KEY', 'auth enforced, got ' + JSON.stringify(out).slice(0, 120));
		console.log('ok 2 - auth enforced');
	}

	// 3. scaffold translate with glossary hits
	let firstBody;
	{
		const r = new AgentTranslateRoutes(authed({ post: { text: 'בראשית ברא אלוקים את השמים ואת הארץ. ויאמר אלוקים יהי אור.' } }));
		const out = await r.routes()['/agent/translate']();
		assert.ok(out.success, 'translate success: ' + JSON.stringify(out).slice(0, 200));
		assert.equal(out.success.engine, 'scaffold');
		assert.ok(out.success.segments.length >= 2, 'segmented');
		const hits = out.success.segments.flatMap(s => s.glossaryHits);
		const elokim = hits.find(h => h.term === 'elokim');
		assert.ok(elokim && elokim.en === 'Elokim', 'glossary hit elokim->Elokim');
		assert.ok(out.success.segments[0].scaffoldEn.includes('Elokim'), 'scaffoldEn applied');
		assert.ok(out.success.rateLimit.remaining >= 0, 'rate limit info');
		firstBody = out.success;
		console.log('ok 3 - scaffold translate + glossary');
	}

	// 4. idempotency replay
	{
		const mk = () => new AgentTranslateRoutes(authed({ post: { text: 'שלום עולם', idempotencyKey: 'idem-123' }, headers: {} }));
		const a = await mk().routes()['/agent/translate']();
		const b = await mk().routes()['/agent/translate']();
		assert.ok(a.success && !a.success.idempotentReplay, 'first not replay');
		assert.ok(b.success && b.success.idempotentReplay === true, 'second is replay');
		assert.equal(b.success.segments.length, a.success.segments.length, 'replay same body');
		console.log('ok 4 - idempotency');
	}

	// 5. rate limit trips
	{
		const fresh = 'awt_test_' + crypto.randomBytes(12).toString('hex');
		const fh = crypto.createHash('sha256').update(fresh).digest('hex');
		await db.write('/social/apiKeys/byHash/' + fh, { userId: 'agent2', keyId: 'k2' });
		await db.write('/social/users/agent2/apiKeys/k2', { id: 'k2', hash: fh, createdAt: Date.now(), revokedAt: null });
		let limited = 0;
		for (let i = 0; i < 25; i++) {
			const r = new AgentTranslateRoutes(makeI(db, { method: 'POST', post: { apiKey: fresh, text: 'אבג' } }));
			const out = await r.routes()['/agent/translate']();
			if (out.error && out.error.code === 'RATE_LIMITED') limited++;
		}
		assert.ok(limited >= 3, 'rate limit trips, got ' + limited);
		console.log('ok 5 - rate limit');
	}

	// 6. batch job lifecycle
	{
		const r = new AgentTranslateRoutes(authed({ post: { items: [{ key: 'a', text: 'יום אחד' }, { key: 'b', text: 'יום שני' }] } }));
		const created = await r.routes()['/agent/translate/batch']();
		assert.ok(created.success && created.success.jobId, 'batch created');
		const jobId = created.success.jobId;
		let status = null;
		for (let i = 0; i < 40; i++) {
			const jr = new AgentTranslateRoutes(makeI(db, { method: 'GET', get: { apiKey: secret, id: jobId } }));
			const polled = await jr.routes()['/agent/translate/job']();
			status = polled.success;
			if (status && status.status === 'done') break;
			await new Promise(res => setTimeout(res, 100));
		}
		assert.ok(status && status.status === 'done', 'job done');
		assert.equal(status.results.length, 2, 'two results');
		assert.ok(status.results.every(x => x.ok), 'results ok');
		console.log('ok 6 - batch job');
	}

	// 7. submit translation
	{
		const r = new AgentTranslateRoutes(authed({
			post: {
				segments: [{ text: 'שלום' }],
				translations: [{ text: 'Peace' }],
				postRef: { heichel: 'ikar', series: 's1', post: 'p1' }
			}
		}));
		const out = await r.routes()['/agent/translate/submit']();
		assert.ok(out.success && out.success.submissionId, 'submitted');
		assert.equal(out.success.segmentCount, 1);
		console.log('ok 7 - submit');
	}

	// 8. corpora
	{
		const r = new AgentTranslateRoutes(makeI(db, { method: 'GET', get: { apiKey: secret } }));
		const out = await r.routes()['/agent/corpora']();
		assert.ok(out.success && out.success.corpora.length > 10, 'corpora listed');
		assert.ok(out.success.corpora.some(c => c.id === 'tanach-commentary' && c.posts === 1011), 'tanach commentary present');
		console.log('ok 8 - corpora');
	}

	// 9. glossary lookup
	{
		const r = new AgentTranslateRoutes(makeI(db, { method: 'GET', get: { apiKey: secret, term: 'yackov' } }));
		const out = await r.routes()['/agent/glossary']();
		assert.ok(out.success && out.success.entries.length === 1, 'one entry');
		assert.equal(out.success.entries[0].en, 'Yackov');
		console.log('ok 9 - glossary');
	}

	// 10. search glossary scope
	{
		const r = new AgentTranslateRoutes(makeI(db, { method: 'GET', get: { apiKey: secret, q: 'elokim', scope: 'glossary' } }));
		const out = await r.routes()['/agent/search']();
		assert.ok(out.success && out.success.glossary.length >= 1, 'glossary search hits');
		console.log('ok 10 - search');
	}

	// 11. search finds submitted translation
	{
		const r = new AgentTranslateRoutes(makeI(db, { method: 'GET', get: { apiKey: secret, q: 'שלום', scope: 'translations' } }));
		const out = await r.routes()['/agent/search']();
		assert.ok(out.success && out.success.translations.length >= 1, 'translation memory hit');
		console.log('ok 11 - translation memory search');
	}

	// 12. post validation
	{
		const r = new AgentTranslateRoutes(makeI(db, { method: 'GET', get: { apiKey: secret } }));
		const out = await r.routes()['/agent/post']();
		assert.ok(out.error && out.error.code === 'MISSING_POST_REF', 'post ref required');
		console.log('ok 12 - post validation');
	}

	// 13. translation-status validation
	{
		const r = new AgentTranslateRoutes(makeI(db, { method: 'GET', get: { apiKey: secret } }));
		const out = await r.routes()['/agent/translation-status']();
		assert.ok(out.error && out.error.code === 'MISSING_REF', 'status ref required');
		console.log('ok 13 - status validation');
	}

	// 14. SSE stream
	{
		const $i = authed({ post: { text: 'אור. חושך.' } });
		const r = new AgentTranslateRoutes($i);
		const ret = await r.routes()['/agent/translate/stream']();
		assert.equal($i.response.headers['Content-Type'], 'text/event-stream', 'sse content type');
		const text = $i.response._writes.join('');
		assert.ok(text.includes('"type":"start"'), 'start event');
		assert.ok(text.includes('"type":"segment"'), 'segment events');
		assert.ok(text.includes('"type":"done"'), 'done event');
		assert.ok($i.response.ended, 'stream ended');
		console.log('ok 14 - sse stream');
	}

	// 15. engine mode without configured engine -> honest error
	{
		const r = new AgentTranslateRoutes(authed({ post: { text: 'שלום', mode: 'engine' } }));
		const out = await r.routes()['/agent/translate']();
		assert.ok(out.error && out.error.code === 'NO_ENGINE', 'honest no-engine error');
		console.log('ok 15 - engine mode honesty');
	}

	console.log('B"H all 15 agent API checks passed.');
}

main().catch(e => {
	console.error('AGENT API TEST FAILED:', e);
	process.exit(1);
});
