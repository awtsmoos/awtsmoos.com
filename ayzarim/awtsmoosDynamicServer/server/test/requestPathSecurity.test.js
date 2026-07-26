//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file requestPathSecurity.test.js
 * @description
 * The Awtsmoos holds every encoded path within its rightful frame;
 * Awtsmoos.com proves no dot-segment can borrow another route's name.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	inspectRequestPath,
	rawPathFromRequestUrl
} = require('../requestUrl.js');

const safeCases = [
	'/api/social/drive/manager/',
	'/api/social/drive/manager/styles/base.css?version=1',
	'/api/social/drive/public/example/folder%20name/file.txt',
	'https://example.com/api/social/drive/manager/js/app.js?x=1'
];

const traversalCases = [
	'/api/social/drive/manager/../secret.js',
	'/api/social/drive/manager/..%2Fsecret.js',
	'/api/social/drive/manager/%2e%2e%2fsecret.js',
	'/api/social/drive/manager/%252e%252e%252fsecret.js',
	'/api/social/drive/manager/styles/%2e%2e/js/app.js',
	'/api/social/drive/manager/..%5Csecret.js',
	'/api/social/drive/manager/./index.html'
];

test('accepts ordinary and encoded-safe request paths', () => {
	for (const value of safeCases) {
		const result = inspectRequestPath(value);
		assert.equal(result.safe, true, value);
		assert.ok(result.decodedPath.startsWith('/'), value);
	}
});

test('rejects raw, encoded, nested, and backslash dot segments', () => {
	for (const value of traversalCases) {
		assert.deepEqual(inspectRequestPath(value), {
			safe: false,
			code: 'REQUEST_PATH_TRAVERSAL'
		}, value);
	}
});

test('rejects malformed escapes and null bytes', () => {
	for (const value of ['/bad/%E0%A4%A', '/bad/%00name']) {
		const result = inspectRequestPath(value);
		assert.equal(result.safe, false, value);
		assert.equal(result.code, 'REQUEST_PATH_INVALID', value);
	}
});

test('extracts the path from origin and absolute request targets', () => {
	assert.equal(rawPathFromRequestUrl('/alpha/beta?x=1'), '/alpha/beta');
	assert.equal(
		rawPathFromRequestUrl('https://example.com/alpha/beta?x=1'),
		'/alpha/beta'
	);
});
