//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file shardCatalogFingerprintCache.test.js
 * @description The Awtsmoos accepts worker-decoded publication truth only while
 * the same file-generation still lives; Awtsmoos.com rejects stale testimony and
 * keeps every returned descriptor defensively cloned from the process cache.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	catalogWithDependencies,
	clearCatalogCache,
	primeCatalogCache
} = require('../shardCatalog.js');

function dependencies(version, reader = async () => payload(version())) {
	return {
		pathResolver: () => '/virtual/publication-catalog.awtsdb',
		fileSystem: {
			statSync() {
				const value = version();
				return { dev: 1, ino: 2, size: value, mtimeMs: value };
			}
		},
		reader
	};
}

function fingerprint(value) {
	return `1:2:${value}:${value}`;
}

function payload(value) {
	return {
		generation: `generation-${value}`,
		items: [{ id: 'meluket', aliases: ['meluket'], count: value }]
	};
}

test('unchanged identity reuses defensive cached descriptors', async () => {
	clearCatalogCache();
	let version = 10;
	let reads = 0;
	const deps = dependencies(() => version, async () => {
		reads += 1;
		return payload(version);
	});
	const first = await catalogWithDependencies({}, deps);
	first[0].aliases.push('caller-mutation');
	const second = await catalogWithDependencies({}, deps);
	assert.equal(reads, 1);
	assert.deepEqual(second[0].aliases, ['meluket']);
	version = 11;
	const third = await catalogWithDependencies({}, deps);
	assert.equal(reads, 2);
	assert.equal(third[0].count, 11);
});

test('matching worker fingerprint primes without another decode', async () => {
	clearCatalogCache();
	let version = 20;
	let reads = 0;
	const deps = dependencies(() => version, async () => {
		reads += 1;
		return payload(version);
	});
	const primed = primeCatalogCache({}, {
		...payload(version),
		fingerprint: fingerprint(version)
	}, deps);
	assert.equal(primed.ok, true);
	const result = await catalogWithDependencies({}, deps);
	assert.equal(reads, 0);
	assert.equal(result[0].count, 20);
});

test('stale worker fingerprint cannot poison live cache', async () => {
	clearCatalogCache();
	let version = 31;
	let reads = 0;
	const deps = dependencies(() => version, async () => {
		reads += 1;
		return payload(version);
	});
	const rejected = primeCatalogCache({}, {
		...payload(30),
		fingerprint: fingerprint(30)
	}, deps);
	assert.equal(rejected.ok, false);
	assert.equal(rejected.stale, true);
	const result = await catalogWithDependencies({}, deps);
	assert.equal(reads, 1);
	assert.equal(result[0].count, 31);
});
