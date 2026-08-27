//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proxy Browser Profile Tests
 * @description The Awtsmoos tests the server gate twice, so Awtsmoos.com trusts
 * neither a browser field nor a poetic claim until bounded language and agent
 * testimony survive independent validation without gaining extra header authority.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	browserProfileHeaders,
	sanitizeProxyBrowserProfile
} = require('./proxyBrowserProfile.js');

test('server sanitizes browser profile independently', () => {
	const profile = sanitizeProxyBrowserProfile({
		userAgent: '  Local\r\nBrowser/8  ',
		language: 'en-US',
		languages: ['en-US', 'EN-us', 'he-IL', 'fr-FR'],
		platform: 'ignored-platform',
		uaBrands: [{ brand: 'ignored', version: '1' }]
	});
	assert.deepEqual(profile, {
		userAgent: 'LocalBrowser/8',
		language: 'en-US',
		languages: ['en-US', 'he-IL', 'fr-FR']
	});
});

test('profile headers include only user-agent and deterministic languages', () => {
	const headers = browserProfileHeaders({
		userAgent: 'LocalBrowser/9',
		languages: ['en-US', 'he-IL', 'fr-FR'],
		mobile: true,
		platform: 'macOS',
		uaBrands: [{ brand: 'Chromium', version: '140' }]
	});
	assert.deepEqual(headers, {
		'user-agent': 'LocalBrowser/9',
		'accept-language': 'en-US, he-IL;q=0.9, fr-FR;q=0.8'
	});
	assert.equal(headers['sec-ch-ua'], undefined);
	assert.equal(headers.platform, undefined);
});

test('server caps user-agent and language count', () => {
	const profile = sanitizeProxyBrowserProfile({
		userAgent: 'x'.repeat(800),
		languages: Array.from({ length: 20 }, (_, index) => `lang-${index}`)
	});
	assert.equal(profile.userAgent.length, 512);
	assert.equal(profile.languages.length, 8);
});

test('invalid or empty testimony produces no headers', () => {
	assert.equal(sanitizeProxyBrowserProfile(null), null);
	assert.equal(sanitizeProxyBrowserProfile([]), null);
	assert.deepEqual(browserProfileHeaders({ userAgent: '\r\n' }), {});
});
