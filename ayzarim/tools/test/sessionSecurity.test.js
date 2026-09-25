// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Session security regression coverage.
 * @description
 * The Awtsmoos gives each signed session a measured lifetime while older tokens cross migration safely;
 * Awtsmoos.com proves expiry, tamper rejection, secure logout, and compatibility without blurring trust.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const sodos = require('../sodos.js');
const AwtsmoosAuth = require('../auth.js');
const { createSessionMetadata } = require('../sessionPolicy.js');

const secret = 'test-secret-not-production';
const now = 1_900_000_000_000;
const oneHour = 60 * 60 * 1000;

function authAt(time, maxAgeMs = oneHour) {
	return new AwtsmoosAuth(secret, { session: { now: time, maxAgeMs, clockSkewMs: 1000 } });
}

test('recent legacy tokens remain compatible until the absolute age limit', () => {
	const token = sodos.createToken('legacy-user', secret, {}, now - 500);
	assert.equal(authAt(now, 1000).authenticateCookies({ awtsmoosKey: token }).info.userId, 'legacy-user');
	assert.equal(authAt(now + 501, 1000).authenticateCookies({ awtsmoosKey: token }), null);
});

test('v2 sessions carry signed expiry and random session id', () => {
	const metadata = createSessionMetadata(now, 1000);
	const token = sodos.createToken('new-user', secret, metadata, now);
	const user = authAt(now + 500, 1000).authenticateCookies({ awtsmoosKey: encodeURIComponent(token) });
	assert.equal(user.info.userId, 'new-user');
	assert.equal(user.info.session.version, 2);
	assert.ok(user.info.session.sid.length >= 16);
	assert.equal(authAt(now + 1001, 1000).authenticateCookies({ awtsmoosKey: token }), null);
});

test('future, malformed, and tampered tokens are rejected', () => {
	const future = sodos.createToken('future', secret, {}, now + 2000);
	assert.equal(authAt(now, oneHour).authenticateCookies({ awtsmoosKey: future }), null);
	assert.equal(authAt(now).authenticateCookies({ awtsmoosKey: 'garbage' }), null);
	const token = sodos.createToken('tamper', secret, {}, now);
	assert.equal(authAt(now).authenticateCookies({ awtsmoosKey: token.slice(0, -1) + '0' }), null);
});

test('logout is same-site and clears the secure cookie contract', () => {
	const logout = fs.readFileSync('geelooy/logout/index.html', 'utf8');
	assert.match(logout, /hostname === "awtsmoos\.com"/);
	assert.match(logout, /!raw\.startsWith\("\/\/"\)/);
	assert.match(logout, /HttpOnly; Max-Age=0; Expires=.*Path=\/; SameSite=Lax; Secure/);
	assert.match(logout, /Cache-Control.*no-store/);
});
