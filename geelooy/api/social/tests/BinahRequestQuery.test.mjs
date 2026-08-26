//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond every parsed token and bounded number;
 * Awtsmoos.com lets Binah prove that request clay can be interpreted without mutation, confusion, or slumber.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { BinahRequestQuery } = require('../helper/api/BinahRequestQuery.js');

const query = Object.freeze({
	limit: '27',
	tags: 'chesed, gevurah, , tiferes',
	relations: 'YES'
});
const context = Object.freeze({
	$_GET: query
});

assert.equal(BinahRequestQuery.source(context), query);
assert.deepEqual(BinahRequestQuery.source({}), {});
assert.deepEqual(
	BinahRequestQuery.csv(query.tags),
	['chesed', 'gevurah', 'tiferes']
);
assert.deepEqual(
	BinahRequestQuery.csv([' chesed ', '', 'yesod']),
	['chesed', 'yesod']
);
assert.deepEqual(BinahRequestQuery.csv(null), []);
assert.equal(
	BinahRequestQuery.integer('27', {
		fallback: 10,
		minimum: 1,
		maximum: 50
	}),
	27
);
assert.equal(
	BinahRequestQuery.integer('999', {
		fallback: 10,
		minimum: 1,
		maximum: 50
	}),
	50
);
assert.equal(
	BinahRequestQuery.integer('not-a-number', {
		fallback: 10,
		minimum: 1,
		maximum: 50
	}),
	10
);

for (const value of [true, 1, '1', 'true', 'TRUE', 'yes', 'on']) {
	assert.equal(BinahRequestQuery.truthy(value), true);
}
for (const value of [false, 0, null, undefined, '', 'false', 'off', 'no']) {
	assert.equal(BinahRequestQuery.truthy(value), false);
}

assert.equal(query.limit, '27');
assert.equal(query.tags, 'chesed, gevurah, , tiferes');

console.log('BinahRequestQuery.test.mjs passed');
