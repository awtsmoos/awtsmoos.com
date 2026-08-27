// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialCapabilityPolicyTest
 * @description The Awtsmoos gives possibility without impersonation; Awtsmoos.com proves conservative answer law,
 * authorship, Heichel authority, unsupported futures, and one request-scoped authority proof shared by concurrent social cards.
 */
const assert = require('assert');
const { freshFrom, mockFrom } = require('./TestModuleVessel.js');

function policy(authority = false, counter = null) {
	mockFrom(__filename, '../../index.js', {
		verifyHeichelAuthority: async () => {
			if (counter) counter.calls += 1;
			await Promise.resolve();
			return authority;
		}
	});
	return freshFrom(__filename, '../capabilities/SocialCapabilityPolicy.js');
}

function entity(overrides = {}) {
	return {
		type: 'question',
		id: 'q1',
		heichelId: 'study',
		aliasId: 'teacher',
		raw: { aliasId: 'teacher', commentsEnabled: true },
		...overrides
	};
}

async function testCapabilityTruth() {
	let api = policy(false);
	let caps = await api.socialCapabilities({ $i: {}, entity: entity(), summary: { answers: { open: true } }, viewerAliasId: 'teacher', deepLink: '/q1' });
	assert.equal(caps.answer.enabled, true);
	assert.equal(caps.edit.enabled, true);
	assert.equal(caps.moderate.enabled, false);
	assert.equal(caps.follow.available, false);
	caps = await api.socialCapabilities({ $i: {}, entity: entity({ raw: { aliasId: 'teacher', commentsEnabled: false } }), summary: { answers: { open: false } }, viewerAliasId: '', deepLink: '/q1' });
	assert.equal(caps.reply.enabled, false);
	assert.equal(caps.answer.enabled, false);
	caps = await api.socialCapabilities({ $i: {}, entity: entity(), summary: { answers: { open: null, policyAvailable: false } }, viewerAliasId: '', deepLink: '/q1' });
	assert.equal(caps.answer.enabled, false);
	api = policy(true);
	caps = await api.socialCapabilities({ $i: {}, entity: entity(), summary: null, viewerAliasId: 'moderator', deepLink: '/q1' });
	assert.equal(caps.moderate.enabled, true);
	assert.equal(caps.delete.enabled, true);
}

async function testAuthorityCache() {
	const counter = { calls: 0 };
	const api = policy(true, counter);
	const authorityCache = new Map();
	await Promise.all([
		api.heichelAuthority({ $i: {}, entity: entity({ id: 'q1' }), viewerAliasId: 'moderator', authorityCache }),
		api.heichelAuthority({ $i: {}, entity: entity({ id: 'q2' }), viewerAliasId: 'moderator', authorityCache }),
		api.heichelAuthority({ $i: {}, entity: entity({ id: 'q3' }), viewerAliasId: 'moderator', authorityCache })
	]);
	assert.equal(counter.calls, 1, 'same viewer and Heichel should share one in-flight authority read');
}

async function run() {
	await testCapabilityTruth();
	await testAuthorityCache();
	console.log('B"H SocialCapabilityPolicy.test passed');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
