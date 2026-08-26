//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond Profile versions, cache hints, and rate garments;
 * Awtsmoos.com lets Malchus prove that the richer v2 profile covenant remains exact while its construction becomes shared and clear.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { MalchusResponseGarments } = require('../helper/api/MalchusResponseGarments.js');

const data = {
	aliasId: 'moshe'
};
const success = MalchusResponseGarments.profileSuccess(data, {
	etag: 'W/"fixed"',
	query: {
		cost: '2'
	},
	pageInfo: {
		nextCursor: 'abc'
	},
	extra: {
		projection: 'summary'
	}
});

assert.deepEqual(success, {
	BH: 'B"H',
	ok: true,
	data,
	success: data,
	meta: {
		version: '2.0',
		etag: 'W/"fixed"',
		cache: {
			ttlSeconds: 20,
			scope: 'social'
		},
		rateLimit: {
			limit: 600,
			remaining: 599,
			resetSeconds: 60,
			policy: 'metadata-only-local-dev',
			cost: 2
		},
		pageInfo: {
			nextCursor: 'abc'
		},
		projection: 'summary'
	}
});
assert.equal(success.success, success.data);

const failure = MalchusResponseGarments.profileFailure(
	'NO_ALIAS',
	'Alias missing.',
	{
		aliasId: 'x'
	}
);

assert.deepEqual(failure, {
	BH: 'B"H',
	ok: false,
	error: {
		code: 'NO_ALIAS',
		message: 'Alias missing.',
		details: {
			aliasId: 'x'
		}
	},
	meta: {
		version: '2.0',
		rateLimit: {
			limit: 600,
			remaining: 599,
			resetSeconds: 60,
			policy: 'metadata-only-local-dev',
			cost: 1
		}
	}
});

console.log('MalchusProfileGarments.test.mjs passed');
