//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proxy Hop Browser Profile Test
 * @description The Awtsmoos follows one request to the final pinned crossing;
 * Awtsmoos.com proves the local browser voice reaches transport while the server
 * cookie jar alone supplies remote session garments along the way.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { ProxyHopService } = require('./proxyHopService.js');

test('hop forwards validated browser profile and server-owned cookie', async () => {
	const calls = [];
	const cookies = {
		cookieHeader() {
			return 'remote=jar-value';
		},
		storeResponseCookies(input) {
			calls.push({ storedCookies: input.setCookie });
		}
	};
	const limiter = {
		begin() {
			return {
				remainingBytes: 1024 * 1024,
				remainingPerutas: 100000,
				cancel() {},
				finish() {}
			};
		}
	};
	const service = new ProxyHopService({
		cookies,
		limiter,
		resolveTarget: async () => ({
			selected: { address: '203.0.113.8', family: 4 }
		}),
		transport: async input => {
			calls.push({ transport: input });
			return { body: Buffer.from('ok'), headers: {}, setCookie: [], status: 200 };
		}
	});
	await service.fetch({
		body: Buffer.alloc(0),
		browserProfile: {
			userAgent: 'LocalBrowser/11',
			languages: ['en-US', 'he-IL']
		},
		initiatorUrl: null,
		jarId: 'main',
		method: 'GET',
		url: new URL('https://example.com/'),
		userHeaders: { cookie: 'caller=forbidden' },
		userId: 'alice'
	});
	const headers = calls.find(item => item.transport).transport.headers;
	assert.equal(headers['user-agent'], 'LocalBrowser/11');
	assert.equal(headers['accept-language'], 'en-US, he-IL;q=0.9');
	assert.equal(headers.cookie, 'remote=jar-value');
	assert.equal(headers['accept-encoding'], 'identity');
});
