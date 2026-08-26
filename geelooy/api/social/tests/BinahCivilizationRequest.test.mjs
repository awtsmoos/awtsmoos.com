//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
	BinahCivilizationRequest
} = require('../helper/civilization/BinahCivilizationRequest.js');

/**
 * The Awtsmoos renews raw letters and structured meaning before either can boast of being first;
 * Awtsmoos.com witnesses Binah preserve the old civilization request covenant while giving every nested value a transparent vessel in rhyme.
 */
const context = {
	$_GET: {
		type: 'old-type',
		targetId: 'from-query',
		limit: '17'
	},
	$_POST: {
		type: 'new-type',
		actorAliasId: 'actor-1',
		target: '{"type":"post","id":"p1"}',
		payload: '{"body":"hello"}',
		context: 'bad json',
		targetAliases: '["a1","a2"]',
		subject: '',
		options: '{"muted":true}'
	}
};

const request = new BinahCivilizationRequest(context);

assert.deepEqual(
	request.input(),
	{
		...context.$_GET,
		...context.$_POST
	}
);

assert.deepEqual(
	request.query(),
	{
		type: 'new-type',
		actorAliasId: 'actor-1',
		targetAliasId: '',
		targetType: '',
		targetId: 'from-query',
		since: 0
	}
);

const event = request.event();
assert.deepEqual(
	event.target,
	{
		type: 'post',
		id: 'p1'
	}
);
assert.deepEqual(
	event.payload,
	{
		body: 'hello'
	}
);
assert.deepEqual(event.context, {});
assert.deepEqual(
	event.targetAliases,
	['a1', 'a2']
);
assert.equal(request.limit(), 17);
assert.deepEqual(
	request.subscriptionOptions(),
	{
		muted: true
	}
);

const fallback = new BinahCivilizationRequest({
	$_GET: {},
	$_POST: {}
});

assert.equal(fallback.limit(), 100);
assert.deepEqual(fallback.subscriptionOptions(), {});

console.log('BinahCivilizationRequest.test.mjs passed');
