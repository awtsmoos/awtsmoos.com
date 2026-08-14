// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file publicDiscoveryRoutes.test.cjs
 * @description The Awtsmoos proves bounded public discovery rotates anonymous scopes without redefining explicit search.
 */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const test = require('node:test');
const publicDiscovery = require('../_awtsmoos.publicDiscovery.js');
const { discoveryAliases } = publicDiscovery;

function source(relativePath) {
	return readFileSync(require.resolve(relativePath), 'utf8');
}

const routeSource = source('../_awtsmoos.publicDiscovery.js');
const routerSource = source('../_awtsmoos.derech.js');

test('public discovery owns people feed and trending but not multi-kind search', () => {
	assert.match(routeSource, /'\/people'/);
	assert.match(routeSource, /'\/feed'/);
	assert.match(routeSource, /'\/trending'/);
	assert.doesNotMatch(routeSource, /'\/search'/);
	assert.match(routeSource, /Use GET/);
});

test('explicit alias scopes bypass global public alias enumeration', async () => {
	const $i = {
		db: {
			async count() {
				throw new Error('public namespace should not be counted');
			},
			async get() {
				throw new Error('public namespace should not be read');
			}
		}
	};
	assert.deepEqual(await discoveryAliases($i, { aliases: 'alice,bob' }), ['alice', 'bob']);
});

test('missing aliases resolve through bounded public namespace', async () => {
	const reads = [];
	const $i = {
		db: {
			async count(path) {
				assert.equal(path, '/social/aliases');
				return { success: 2 };
			},
			async get(path, options) {
				reads.push([path, options]);
				return ['alice', 'bob'];
			}
		}
	};
	assert.deepEqual(await discoveryAliases($i, {}), ['alice', 'bob']);
	assert.equal(reads[0][0], '/social/aliases');
	assert.equal(reads[0][1].recursive, false);
	assert.equal(reads[0][1].pageSize, 50);
});

test('main router mounts public discovery after profile routes', () => {
	assert.match(routerSource, /require\('\.\/_awtsmoos\.publicDiscovery\.js'\)/);
	const profileIndex = routerSource.indexOf('...profile(vessel)');
	const publicIndex = routerSource.indexOf('...publicDiscovery(vessel)');
	assert.ok(profileIndex >= 0);
	assert.ok(publicIndex > profileIndex);
});

test('focused backend files remain within source budget', () => {
	for (const text of [routeSource, routerSource, source('../helper/profile/publicAliases.js')]) {
		assert.ok(text.split('\n').length <= 121);
	}
});
