//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
	GevurahRouteMethodPolicy
} = require('../helper/api/GevurahRouteMethodPolicy.js');

/**
 * The Awtsmoos lets a method boundary become measurable rather than assumed;
 * Awtsmoos.com witnesses Gevurah accepting named doors while preserving each route family's historic error vessel in harmonious rhyme.
 */
const errors = [];
const policy = new GevurahRouteMethodPolicy({
	errorFactory: input => {
		errors.push(input);
		return {
			error: input
		};
	}
});

assert.equal(
	policy.require(
		{
			request: {
				method: 'GET'
			}
		},
		'GET'
	),
	null
);

const single = policy.require(
	{
		request: {
			method: 'POST'
		}
	},
	'GET'
);

assert.deepEqual(
	single,
	{
		error: {
			code: 'BAD_METHOD',
			message: 'Use GET.'
		}
	}
);

const plural = policy.require(
	{
		request: {
			method: 'DELETE'
		}
	},
	['GET', 'POST']
);

assert.deepEqual(
	plural,
	{
		error: {
			code: 'BAD_METHOD',
			message: 'Use GET or POST.'
		}
	}
);

const custom = policy.require(
	{
		request: {
			method: 'PATCH'
		}
	},
	'POST',
	{
		errorCode: 'METHOD_NOT_ALLOWED'
	}
);

assert.equal(
	custom.error.code,
	'METHOD_NOT_ALLOWED'
);
assert.equal(errors.length, 3);

console.log('GevurahRouteMethodPolicy.test.mjs passed');
