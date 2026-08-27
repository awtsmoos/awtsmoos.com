// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file requestSnapshot.test.js
 * @chapter One Mutable Interface May Host Many Requests But Their Values Never Mix
 * @description
 * Captures two requests from the same mutable interface, mutates it between captures,
 * and proves every route option remains bound to its original lane and query.
 */

const assert = require('node:assert/strict');
const {
	captureSearchRequest
} = require('../../routes/requestSnapshot.js');
const {
	data,
	query,
	strictRagOptions
} = require('../../routes/values.js');

const sharedInterface = {
	$_GET: {
		lane: 'sefer-hasichos-english-comments-rag',
		q: 'Torah',
		strategy: 'text',
		autoInstall: 'true'
	},
	$_POST: {
		limit: '7'
	}
};

const seferContext = {
	$i: sharedInterface,
	requestSnapshot: captureSearchRequest(sharedInterface)
};

sharedInterface.$_GET = {
	lane: 'meluket-english-comments-rag',
	q: 'Moshiach'
};
sharedInterface.$_POST = {
	limit: '3'
};

const meluketContext = {
	$i: sharedInterface,
	requestSnapshot: captureSearchRequest(sharedInterface)
};

assert.equal(query(seferContext).lane, 'sefer-hasichos-english-comments-rag');
assert.equal(data(seferContext).limit, '7');
assert.equal(query(meluketContext).lane, 'meluket-english-comments-rag');
assert.equal(data(meluketContext).limit, '3');

const seferOptions = strictRagOptions(seferContext);
const meluketOptions = strictRagOptions(meluketContext);
assert.equal(seferOptions.lane, 'sefer-hasichos-english-comments-rag');
assert.equal(seferOptions.query, 'Torah');
assert.equal(seferOptions.limit, 7);
assert.equal(meluketOptions.lane, 'meluket-english-comments-rag');
assert.equal(meluketOptions.query, 'Moshiach');
assert.equal(meluketOptions.limit, 3);
for (const options of [seferOptions, meluketOptions]) {
	assert.equal(options.requireIndexed, true);
	assert.equal(options.strategy, 'vector');
	assert.equal(options.autoInstall, false);
}

assert(Object.isFrozen(seferContext.requestSnapshot));
assert(Object.isFrozen(seferContext.requestSnapshot.get));
assert(Object.isFrozen(seferContext.requestSnapshot.post));
console.log('requestSnapshot.test passed');
