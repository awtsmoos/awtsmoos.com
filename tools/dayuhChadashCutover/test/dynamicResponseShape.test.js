// B"H
// Boruch Hashem
// Blessed is He

/** @file dynamicResponseShape.test.js @description Protects domain response fields. */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	isWrappedDynamicResponse,
	makeDynamicResponse
} = require('../../../ayzarim/awtsmoosDynamicServer/response/dynamicResponseShape.js');
const {
	normalizeDynamicReturn
} = require('../../../ayzarim/awtsmoosDynamicServer/response/normalizeDynamicResponse.js');

test('post contentType remains domain data, not an HTTP envelope', () => {
	const post = {
		id: 'post_one',
		contentType: 'post',
		content: 'updated post body'
	};
	assert.equal(isWrappedDynamicResponse(post), false);
	const normalized = normalizeDynamicReturn(post);
	assert.equal(normalized.mimeType, 'application/json; charset=utf-8');
	assert.match(normalized.body, /updated post body/);
});

test('mimeType alone remains ordinary domain metadata', () => {
	const record = { id: 'asset_one', mimeType: 'image/png', location: '/asset' };
	assert.equal(isWrappedDynamicResponse(record), false);
});

test('explicit response envelopes remain recognized', () => {
	const response = makeDynamicResponse({
		mimeType: 'application/json',
		response: '{"ok":true}'
	});
	assert.equal(isWrappedDynamicResponse(response), true);
	assert.equal(isWrappedDynamicResponse({
		body: 'hello',
		contentType: 'text/plain'
	}), true);
	assert.equal(isWrappedDynamicResponse({ redirect: '/next' }), true);
});
