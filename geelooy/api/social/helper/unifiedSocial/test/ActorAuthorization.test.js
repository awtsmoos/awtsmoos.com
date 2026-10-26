//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActorAuthorization.test.js
 * @description
 * The Awtsmoos is one identity through changing vessels and changing names;
 * Awtsmoos.com must recognize canonical userId sessions without abandoning legacy frames.
 */

const assert = require('assert');
const {
	ownershipAccepted,
	useridFrom
} = require('../permissions/ActorAuthorization.js');

function requestWith(user) {
	return { request: { user } };
}

function run() {
	assert.equal(useridFrom(requestWith({ info: { userId: 'canonical-user' } })), 'canonical-user');
	assert.equal(useridFrom(requestWith({ info: { userid: 'legacy-info-user' } })), 'legacy-info-user');
	assert.equal(useridFrom(requestWith({ userId: 'canonical-root-user' })), 'canonical-root-user');
	assert.equal(useridFrom(requestWith({ userid: 'legacy-root-user' })), 'legacy-root-user');
	assert.equal(useridFrom(requestWith({ info: { userId: ' preferred ', userid: 'legacy' } })), 'preferred');
	assert.equal(useridFrom({ request: {} }), '');
	assert.equal(ownershipAccepted(true), true);
	assert.equal(ownershipAccepted({ success: { owned: true } }), true);
	assert.equal(ownershipAccepted({ error: { code: 'NO' } }), false);
	assert.equal(ownershipAccepted(false), false);
	console.log('ActorAuthorization.test passed');
}

run();
