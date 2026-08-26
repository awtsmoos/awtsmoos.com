//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file scopePolicy.test.js
 * @description
 * The Awtsmoos gives public revelation an additional boundary rather than letting it replace ordinary write authority;
 * Awtsmoos.com tests that creation, metadata mutation, and streaming all carry the same compound-scope clarity.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	creationScopes,
	entryScopes,
	streamingScopes
} = require('../scopePolicy.js');

test('requires public authority in addition to write authority for public creation', testCreationScopes);
test('keeps entry mutation scopes additive for visibility and cache changes', testEntryScopes);
test('keeps streaming public/cache authority additive to write authority', testStreamingScopes);

/**
 * @description Verifies ordinary private creation needs write scope while explicit visibility/cache metadata adds public scope.
 * @returns {void}
 */
function testCreationScopes() {
	assert.deepEqual(creationScopes({}), ['drive.write']);
	assert.deepEqual(creationScopes({ visibility: 'public' }), ['drive.write', 'drive.public']);
	assert.deepEqual(creationScopes({ cachePolicy: 'immutable' }), ['drive.write', 'drive.public']);
}

/**
 * @description Verifies reads/deletes retain their dedicated scopes and metadata-only publication remains a compound write/public mutation.
 * @returns {void}
 */
function testEntryScopes() {
	assert.equal(entryScopes('GET', {}), 'drive.read');
	assert.equal(entryScopes('HEAD', {}), 'drive.read');
	assert.equal(entryScopes('DELETE', {}), 'drive.delete');
	assert.equal(entryScopes('PUT', {}), 'drive.write');
	assert.deepEqual(entryScopes('PUT', { visibility: 'private' }), ['drive.write', 'drive.public']);
	assert.deepEqual(entryScopes('PUT', { text: 'x', visibility: 'public' }), ['drive.write', 'drive.public']);
}

/**
 * @description Verifies streaming defaults remain private-write only while explicit public/cache metadata or a public result requires both scopes.
 * @returns {void}
 */
function testStreamingScopes() {
	assert.deepEqual(streamingScopes({ visibility: 'private', cachePolicy: 'mutable' }), ['drive.write']);
	assert.deepEqual(streamingScopes({ visibility: 'public', cachePolicy: 'immutable' }), ['drive.write', 'drive.public']);
	assert.deepEqual(streamingScopes({ visibility: 'private', cachePolicy: 'mutable', visibilityExplicit: true }), ['drive.write', 'drive.public']);
}
