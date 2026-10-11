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
			if (!map.has(p)) return null;
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

	// -- Agent-as-user transactions (16-25) ---------------------------------
	const fs = require('node:fs');
	const os = require('node:os');
	const path = require('node:path');
	const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-tx-'));

	function makeTxDb() {
		const db = makeDb();
		db.directory = tmpRoot; // packed JSONL mirrors land here, not in prod
		db.syncKeyInObj = async (p, k) => {
			const cur = await db.get(p).catch(() => null);
			const obj = (cur && typeof cur === 'object') ? { ...cur } : {};
			obj[k] = true;
			await db.write(p, obj);
		};
		db.syncKeyInArray = async (p, v) => {
			const cur = await db.get(p).catch(() => null);
			const arr = Array.isArray(cur) ? [...cur] : [];
			if (!arr.includes(v)) arr.push(v);
			await db.write(p, arr);
		};
		db.removeElementFromArray = async (p, matcher) => {
			const cur = await db.get(p).catch(() => null);
			if (!Array.isArray(cur)) return;
			const want = matcher && matcher.exact && matcher.exact.selfEquals;
			await db.write(p, cur.filter(x => x !== want));
		};
		db.delete = async p => { db._map.delete(p); };
		db.deleteEntry = async (p, key) => {
			const cur = await db.get(p).catch(() => null);
			if (cur && typeof cur === 'object' && !Array.isArray(cur)) {
				const obj = { ...cur };
				delete obj[key];
				await db.write(p, obj);
			} else {
				db._map.delete(p + '/' + key);
			}
			return { ok: true };
		};
		db.updateEntry = async (p, { key, value }) => {
			const cur = await db.get(p).catch(() => null);
			const obj = (cur && typeof cur === 'object') ? { ...cur } : {};
			obj[key] = value;
			await db.write(p, obj);
			return { ok: true };
		};
		const rawGet = db.get;
		db.get = async (p, opts) => {
			let val = await rawGet(p);
			if ((val === null || val === undefined) && typeof p === 'string') {
				// Production-faithful subtree read: assemble one level of children.
				const prefix = p.endsWith('/') ? p : p + '/';
				const out = {};
				let found = false;
				for (const k of db._map.keys()) {
					if (k.startsWith(prefix)) {
						const rest = k.slice(prefix.length);
						const seg = rest.split('/')[0];
						if (seg && !(seg in out)) { out[seg] = db._map.get(k); found = true; }
					}
				}
				if (found) val = out;
			}
			if (opts && opts.propertyMap && val && typeof val === 'object') {
				const out = {};
				for (const k of Object.keys(opts.propertyMap)) if (k in val) out[k] = val[k];
				return out;
			}
			return val;
		};
		return db;
	}

	const txDb = makeTxDb();
	const txSecret = 'awt_test_' + crypto.randomBytes(12).toString('hex');
	const txHash = crypto.createHash('sha256').update(txSecret).digest('hex');
	await txDb.write('/social/apiKeys/byHash/' + txHash, { userId: 'agentTx', keyId: 'k9' });
	await txDb.write('/social/users/agentTx/apiKeys/k9', { id: 'k9', hash: txHash, createdAt: Date.now(), revokedAt: null });
	await txDb.write('/users/agentTx/aliases/alias1', { id: 'alias1', name: 'Agent Scribe' });

	function makeTxI({ method = 'POST', get = {}, post = {}, headers = {} } = {}) {
		const base = makeI(txDb, { method, get, post, headers });
		base.fetchAwtsmoos = async () => ({});
		base.utils = {
			generateId: name => 'h_' + String(name || 'x').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12),
			verifyStrict: () => true
		};
		base.createJob = async () => ({ jobId: 'job_tx_test' });
		return base;
	}
	const txAuthed = (extra = {}) => makeTxI({ method: extra.method || 'POST', post: { apiKey: txSecret, ...extra.post }, get: extra.get || {}, headers: extra.headers || {} });

	let heichelId;
	// 16. heichel create
	{
		const r = new AgentTranslateRoutes(txAuthed({ post: { alias: 'alias1', name: 'Agent Test Heichel', description: 'made by the agent api' } }));
		const out = await r.routes()['/agent/heichelos/create']();
		assert.ok(out.success && out.success.heichel, 'heichel created: ' + JSON.stringify(out).slice(0, 200));
		heichelId = out.success.heichel.heichelId;
		assert.ok(heichelId, 'heichelId returned');
		const editors = await txDb.get('/social/heichelos/' + heichelId + '/editors');
		assert.ok(Array.isArray(editors) && editors.includes('alias1'), 'creator is editor');
		console.log('ok 16 - heichel create');
	}

	// 17. heichel create idempotency replay
	{
		const mk = () => new AgentTranslateRoutes(txAuthed({ post: { alias: 'alias1', name: 'Second Heichel', idempotencyKey: 'tx-idem-h1' } }));
		const a = await mk().routes()['/agent/heichelos/create']();
		const b = await mk().routes()['/agent/heichelos/create']();
		assert.ok(a.success && !a.success.idempotentReplay, 'first not replay');
		assert.ok(b.success && b.success.idempotentReplay === true, 'second is replay');
		assert.equal(b.success.heichel.heichelId, a.success.heichel.heichelId, 'same heichel');
		console.log('ok 17 - heichel create idempotency');
	}

	// 18. heichel create with someone else's alias -> NO_ALIAS
	{
		const r = new AgentTranslateRoutes(txAuthed({ post: { alias: 'aliasX', name: 'Sneaky Heichel' } }));
		const out = await r.routes()['/agent/heichelos/create']();
		assert.ok(out.error && out.error.code === 'NO_ALIAS', 'alias ownership enforced');
		console.log('ok 18 - alias ownership');
	}

	// 19. heichel edit (rename)
	{
		const r = new AgentTranslateRoutes(txAuthed({ post: { alias: 'alias1', heichel: heichelId, name: 'Renamed Heichel' } }));
		const out = await r.routes()['/agent/heichelos/edit']();
		assert.ok(out.success, 'heichel edited: ' + JSON.stringify(out).slice(0, 160));
		const info = await txDb.get('/social/heichelos/' + heichelId + '/info');
		assert.equal(info.name, 'Renamed Heichel', 'name updated');
		console.log('ok 19 - heichel edit');
	}

	let postId;
	// 20. post create
	{
		const r = new AgentTranslateRoutes(txAuthed({ post: { alias: 'alias1', heichel: heichelId, title: 'First agent post', content: 'שלום עולם' } }));
		const out = await r.routes()['/agent/posts/create']();
		assert.ok(out.success && out.success.post, 'post created: ' + JSON.stringify(out).slice(0, 200));
		postId = out.success.post.id || out.success.post.postId;
		assert.ok(postId, 'postId returned');
		assert.equal(out.success.post.aliasId, 'alias1', 'author alias set');
		console.log('ok 20 - post create');
	}

	// 21. post create with duplicate postId -> POST_EXISTS
	{
		const r = new AgentTranslateRoutes(txAuthed({ post: { alias: 'alias1', heichel: heichelId, postId, title: 'Dup', content: 'x' } }));
		const out = await r.routes()['/agent/posts/create']();
		assert.ok(out.error && out.error.code === 'POST_EXISTS', 'duplicate postId refused');
		console.log('ok 21 - duplicate postId refused');
	}

	// 22. post edit by author (seed the series copy the way production holds it)
	{
		const created = await txDb.get('/social/heichelos/' + heichelId + '/posts/' + postId + '.awtsmoosJSON');
		await txDb.write('/social/heichelos/' + heichelId + '/series/root/posts', { [postId]: created });
		const r = new AgentTranslateRoutes(txAuthed({ post: { alias: 'alias1', heichel: heichelId, post: postId, title: 'Edited title' } }));
		const out = await r.routes()['/agent/posts/edit']();
		assert.ok(out.success && out.success.wrote && out.success.wrote.title, 'post edited: ' + JSON.stringify(out).slice(0, 200));
		console.log('ok 22 - post edit');
	}

	// 23. post list (mine)
	{
		const r = new AgentTranslateRoutes(makeTxI({ method: 'GET', get: { apiKey: txSecret, alias: 'alias1', heichel: heichelId } }));
		const out = await r.routes()['/agent/posts/list']();
		assert.ok(out.success && Array.isArray(out.success.posts), 'post list ok');
		assert.ok(out.success.posts.some(p => p.postId === postId), 'created post listed');
		console.log('ok 23 - post list');
	}

	// 24. batch import (2 items)
	{
		const r = new AgentTranslateRoutes(txAuthed({ post: { alias: 'alias1', heichel: heichelId, posts: [{ title: 'Batch one', content: 'א' }, { title: 'Batch two', content: 'ב' }] } }));
		const out = await r.routes()['/agent/posts/import']();
		assert.ok(out.success, 'import ok: ' + JSON.stringify(out).slice(0, 200));
		assert.equal(out.success.created.length, 2, 'two created');
		assert.equal(out.success.failed.length, 0, 'none failed');
		console.log('ok 24 - post import');
	}

	// 25. post delete; heichel delete needs confirm; then confirmed delete
	{
		const del = new AgentTranslateRoutes(txAuthed({ post: { alias: 'alias1', heichel: heichelId, post: postId } }));
		const delOut = await del.routes()['/agent/posts/delete']();
		assert.ok(delOut.success, 'post deleted: ' + JSON.stringify(delOut).slice(0, 160));

		const noConfirm = new AgentTranslateRoutes(txAuthed({ post: { alias: 'alias1', heichel: heichelId } }));
		const ncOut = await noConfirm.routes()['/agent/heichelos/delete']();
		assert.ok(ncOut.error && ncOut.error.code === 'CONFIRM_REQUIRED', 'heichel delete needs confirm');

		const yesConfirm = new AgentTranslateRoutes(txAuthed({ post: { alias: 'alias1', heichel: heichelId, confirm: true } }));
		const ycOut = await yesConfirm.routes()['/agent/heichelos/delete']();
		assert.ok(ycOut.success && ycOut.success.deleted === true, 'heichel deleted');
		console.log('ok 25 - post delete + heichel delete');
	}

	console.log('B"H all 25 agent API checks passed.');
}

main().catch(e => {
	console.error('AGENT API TEST FAILED:', e);
	process.exit(1);
});
