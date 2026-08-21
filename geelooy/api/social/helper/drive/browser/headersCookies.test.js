//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proxy Header and Cookie Tests
 * @description The Awtsmoos proves a browser voice may cross without taking
 * Awtsmoos.com session authority with it; server jars remain sealed while safe
 * request and response garments pass through their measured gates.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildProxyRequestHeaders, safeProxyResponseHeaders } = require('./proxyHeaders.js');
const { ProxyCookieJarStore } = require('./proxyCookieJar.js');

test('request headers never forward host, forwarding, or caller cookies', () => {
	const headers = buildProxyRequestHeaders({
		host: 'internal',
		cookie: 'awtsmoos=session',
		'x-forwarded-for': '127.0.0.1',
		authorization: 'Bearer target-token',
		accept: 'text/html'
	}, 'remote=jar-value');
	assert.equal(headers.host, undefined);
	assert.equal(headers['x-forwarded-for'], undefined);
	assert.equal(headers.cookie, 'remote=jar-value');
	assert.equal(headers.authorization, 'Bearer target-token');
	assert.equal(headers['accept-encoding'], 'identity');
});

test('browser profile supplies bounded UA and language without cookie authority', () => {
	const headers = buildProxyRequestHeaders({
		'user-agent': 'ExplicitBrowser/2',
		cookie: 'caller=forbidden'
	}, 'remote=jar-value', {
		userAgent: 'ProfileBrowser/1',
		languages: ['en-US', 'he-IL']
	});
	assert.equal(headers['user-agent'], 'ExplicitBrowser/2');
	assert.equal(headers['accept-language'], 'en-US, he-IL;q=0.9');
	assert.equal(headers.cookie, 'remote=jar-value');
	assert.equal(headers['accept-encoding'], 'identity');
});

test('response headers exclude Set-Cookie and unsafe routing controls', () => {
	const headers = safeProxyResponseHeaders({
		'content-type': 'text/html',
		'set-cookie': ['secret=value'],
		connection: 'upgrade',
		location: '/next'
	});
	assert.deepEqual(headers, {
		'content-type': 'text/html',
		location: '/next'
	});
});

test('cookie jars isolate users and expose metadata without values', () => {
	const store = new ProxyCookieJarStore();
	const url = new URL('https://example.com/account/page');
	store.storeResponseCookies({
		userId: 'alice',
		jarId: 'main',
		url,
		setCookie: ['sid=secret; Path=/; Secure; HttpOnly']
	});
	assert.equal(store.cookieHeader({ userId: 'alice', jarId: 'main', url }), 'sid=secret');
	assert.equal(store.cookieHeader({ userId: 'bob', jarId: 'main', url }), '');
	assert.deepEqual(store.listJars('alice'), [{
		id: 'main',
		cookieCount: 1,
		domains: ['example.com']
	}]);
	assert.equal(JSON.stringify(store.listJars('alice')).includes('secret'), false);
});

test('SameSite and secure cookie rules are enforced with host-level navigation proof', () => {
	const store = new ProxyCookieJarStore();
	const url = new URL('https://example.com/account');
	store.storeResponseCookies({
		userId: 'alice',
		jarId: 'main',
		url,
		setCookie: [
			'strict=one; Path=/; Secure; SameSite=Strict',
			'invalid=two; Path=/; SameSite=None'
		]
	});
	assert.equal(store.cookieHeader({
		userId: 'alice', jarId: 'main', url, method: 'GET'
	}), '');
	assert.equal(store.cookieHeader({
		userId: 'alice', jarId: 'main', url, method: 'POST', initiatorUrl: url
	}), 'strict=one');
});

test('cookie policy refuses Domain scope widening in the first pass', () => {
	const store = new ProxyCookieJarStore();
	const url = new URL('https://login.example.com/');
	store.storeResponseCookies({
		userId: 'alice',
		jarId: 'main',
		url,
		setCookie: ['wide=value; Domain=example.com; Path=/']
	});
	assert.equal(store.cookieHeader({ userId: 'alice', jarId: 'main', url }), '');
});
