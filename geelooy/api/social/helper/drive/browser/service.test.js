//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { ProxyService } = require('./proxyService.js');
const { ProxyCookieJarStore } = require('./proxyCookieJar.js');
const { ProxyRateLimiter } = require('./proxyRateLimiter.js');

test('service revalidates redirects, stores cookies, and strips cross-origin authorization', async () => {
	const resolved = [];
	const requests = [];
	const cookies = new ProxyCookieJarStore();
	let call = 0;
	const service = new ProxyService({
		cookies,
		limiter: new ProxyRateLimiter({ requests: 20, bytes: 10000, concurrent: 2 }),
		resolveTarget: async url => {
			resolved.push(url.hostname);
			return { selected: { address: '93.184.216.34', family: 4 } };
		},
		transport: async options => {
			requests.push(options);
			call += 1;
			if (call === 1) {
				return {
					status: 302,
					headers: {
						location: 'https://other.example/final',
						'set-cookie': ['sid=one; Path=/; Secure; HttpOnly']
					},
					setCookie: ['sid=one; Path=/; Secure; HttpOnly'],
					body: Buffer.alloc(0)
				};
			}
			return {
				status: 200,
				headers: { 'content-type': 'text/plain' },
				setCookie: [],
				body: Buffer.from('done')
			};
		}
	});
	const result = await service.fetch({
		userId: 'alice',
		jarId: 'main',
		url: 'https://example.com/start',
		headers: { authorization: 'Bearer target' }
	});
	assert.deepEqual(resolved, ['example.com', 'other.example']);
	assert.equal(requests[0].headers.authorization, 'Bearer target');
	assert.equal(requests[1].headers.authorization, undefined);
	assert.equal(result.text, 'done');
	assert.equal(result.redirects.length, 1);
	assert.equal(result.usage.requests, 2);
	assert.ok(result.usage.perutas > 0);
	assert.equal(cookies.cookieHeader({
		userId: 'alice',
		jarId: 'main',
		url: new URL('https://example.com/')
	}), 'sid=one');
	assert.equal(JSON.stringify(result.jar).includes('one'), false);
});

test('service refuses unsupported methods before resolver or transport work', async () => {
	let touched = false;
	const service = new ProxyService({
		resolveTarget: async () => {
			touched = true;
			return {};
		},
		transport: async () => {
			touched = true;
			return {};
		}
	});
	await assert.rejects(
		service.fetch({ userId: 'alice', url: 'https://example.com/', method: 'CONNECT' }),
		error => error.code === 'PROXY_METHOD_FORBIDDEN'
	);
	assert.equal(touched, false);
});
