// B"H — standalone test for geelooy/api/social/helper/serviceAuth.js
// Run: node geelooy/api/social/helper/serviceAuth.test.js
const crypto = require('crypto');
const assert = require('assert');
const sa = require('./serviceAuth.js');

let passed = 0;
function ok(name, fn) {
	try { fn(); passed++; console.log('  PASS', name); }
	catch (e) { console.error('  FAIL', name, '-', e.message); process.exitCode = 1; }
}

// Generate an ephemeral keypair for tests (never touches the real VM keys).
const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
const privPem = privateKey.export({ type: 'pkcs8', format: 'pem' });

// Swap in the test public key so verification uses it.
const realKeys = sa.SERVICE_SIGN_PUBLIC_KEYS.slice();
sa.SERVICE_SIGN_PUBLIC_KEYS.length = 0;
sa.SERVICE_SIGN_PUBLIC_KEYS.push(publicKey.export({ type: 'spki', format: 'pem' }));

function signedHeaders(overrides = {}) {
	const p = sa.signServicePayload(privPem, {
		op: overrides.op || 'drive',
		claims: overrides.claims || { aliasId: 'test-alias' },
	});
	if (overrides.ts) p.ts = overrides.ts;
	// re-sign when ts overridden
	if (overrides.ts) {
		const priv = crypto.createPrivateKey(privPem);
		const sig = crypto.sign(null, sa.canonicalServiceBytes({ ts: p.ts, op: p.op, claims: p.claims }), priv);
		p.sig = sig.toString('base64');
	}
	return sa.serviceAuthHeaders(p);
}

console.log('serviceAuth tests:');

ok('hasServiceAuthHeaders false on empty', () => {
	assert.strictEqual(sa.hasServiceAuthHeaders({}), false);
});

ok('authenticateServiceRequest returns null with no headers', () => {
	assert.strictEqual(sa.authenticateServiceRequest({}, { expectedOp: 'drive' }), null);
});

ok('valid signature authenticates with scopes', () => {
	const r = sa.authenticateServiceRequest(signedHeaders(), {
		expectedOp: 'drive',
		expectedClaims: { aliasId: 'test-alias' },
		grantScopes: ['drive.write', 'drive.public'],
	});
	assert.strictEqual(r.ok, true);
	assert.strictEqual(r.actor.actorType, 'service');
	assert.strictEqual(r.actor.aliasId, 'test-alias');
	assert.deepStrictEqual(r.actor.scopes, ['drive.write', 'drive.public']);
});

ok('wrong op rejected', () => {
	const r = sa.authenticateServiceRequest(signedHeaders({ op: 'other' }), { expectedOp: 'drive' });
	assert.strictEqual(r.ok, false);
	assert.strictEqual(r.error, 'SERVICE_OP_MISMATCH');
});

ok('wrong aliasId claim rejected', () => {
	const r = sa.authenticateServiceRequest(signedHeaders(), {
		expectedOp: 'drive',
		expectedClaims: { aliasId: 'different-alias' },
	});
	assert.strictEqual(r.ok, false);
	assert.strictEqual(r.error, 'SERVICE_CLAIM_MISMATCH');
});

ok('stale timestamp rejected', () => {
	const r = sa.authenticateServiceRequest(
		signedHeaders({ ts: Math.floor(Date.now() / 1000) - 3600 }),
		{ expectedOp: 'drive' }
	);
	assert.strictEqual(r.ok, false);
	assert.strictEqual(r.error, 'SERVICE_STALE_TIMESTAMP');
});

ok('tampered signature rejected', () => {
	const h = signedHeaders();
	h['x-awtsmoos-service-sig'] = Buffer.alloc(64).toString('base64');
	const r = sa.authenticateServiceRequest(h, { expectedOp: 'drive' });
	assert.strictEqual(r.ok, false);
	assert.strictEqual(r.error, 'SERVICE_BAD_SIGNATURE');
});

ok('replay rejected', () => {
	const h = signedHeaders({ claims: { aliasId: 'test-alias', nonce: 'replay-test-' + Date.now() } });
	const opts = { expectedOp: 'drive', expectedClaims: { aliasId: 'test-alias' } };
	const r1 = sa.authenticateServiceRequest(h, opts);
	assert.strictEqual(r1.ok, true);
	const r2 = sa.authenticateServiceRequest(h, opts);
	assert.strictEqual(r2.ok, false);
	assert.strictEqual(r2.error, 'SERVICE_REPLAYED_SIGNATURE');
});

ok('canonical bytes deterministic', () => {
	const a = sa.canonicalServiceBytes({ ts: 1, op: 'drive', claims: { b: 2, a: 1 } });
	const b = sa.canonicalServiceBytes({ ts: 1, op: 'drive', claims: { a: 1, b: 2 } });
	assert.ok(a.equals(b));
});

// restore (not strictly needed, process exits)
sa.SERVICE_SIGN_PUBLIC_KEYS.length = 0;
sa.SERVICE_SIGN_PUBLIC_KEYS.push(...realKeys);

console.log(`\n${passed} passed${process.exitCode ? ' (WITH FAILURES)' : ''}`);
