//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { ProxyRateLimiter, proxyRateKey } = require('./proxyRateLimiter.js');

test('rate limiter isolates users and resets by window', () => {
	let now = 0;
	const limiter = new ProxyRateLimiter({
		windowMs: 1000,
		requests: 2,
		bytes: 10,
		concurrent: 2
	}, () => now);
	const alice = proxyRateKey({ userId: 'alice', projectId: 'p1', jarId: 'j1' });
	const bob = proxyRateKey({ userId: 'bob', projectId: 'p1', jarId: 'j1' });
	limiter.begin(alice).finish(4);
	limiter.begin(alice).finish(4);
	assert.throws(
		() => limiter.begin(alice),
		error => error.code === 'PROXY_RATE_LIMITED' && error.status === 429
	);
	assert.doesNotThrow(() => limiter.begin(bob).cancel());
	now = 1001;
	assert.doesNotThrow(() => limiter.begin(alice).cancel());
});

test('project or jar rotation cannot mint a fresh user budget', () => {
	const limiter = new ProxyRateLimiter({
		requests: 1,
		bytes: 1000,
		perutas: 100,
		concurrent: 2
	}, () => 0);
	const first = proxyRateKey({ userId: 'alice', projectId: 'p1', jarId: 'j1' });
	const rotated = proxyRateKey({ userId: 'alice', projectId: 'p2', jarId: 'j2' });
	assert.equal(first, rotated);
	limiter.begin(first).finish(0);
	assert.throws(
		() => limiter.begin(rotated),
		error => error.code === 'PROXY_RATE_LIMITED' && error.violated === 'requests'
	);
});

test('peruta precharges and response charges participate in the same window budget', () => {
	const limiter = new ProxyRateLimiter({
		requests: 10,
		bytes: 1000,
		perutas: 12,
		concurrent: 2
	}, () => 0);
	const key = proxyRateKey({ userId: 'alice', operation: 'browser.fetch' });
	const first = limiter.begin(key, 5);
	assert.equal(first.remainingPerutas, 7);
	first.finish(100, 6);
	assert.throws(
		() => limiter.begin(key, 2),
		error => error.code === 'PROXY_RATE_LIMITED' && error.violated === 'perutas'
	);
});

test('rate limiter enforces byte and concurrency budgets separately', () => {
	const byteLimiter = new ProxyRateLimiter({
		requests: 10,
		bytes: 5,
		concurrent: 2
	}, () => 0);
	const key = proxyRateKey({ userId: 'alice' });
	byteLimiter.begin(key).finish(5);
	assert.throws(
		() => byteLimiter.begin(key),
		error => error.code === 'PROXY_RATE_LIMITED'
	);

	const concurrentLimiter = new ProxyRateLimiter({
		requests: 10,
		bytes: 100,
		concurrent: 1
	}, () => 0);
	const first = concurrentLimiter.begin(key);
	assert.throws(
		() => concurrentLimiter.begin(key),
		error => error.code === 'PROXY_RATE_LIMITED' && error.retryAfterSeconds === 1
	);
	first.cancel();
	assert.doesNotThrow(() => concurrentLimiter.begin(key).cancel());
});
