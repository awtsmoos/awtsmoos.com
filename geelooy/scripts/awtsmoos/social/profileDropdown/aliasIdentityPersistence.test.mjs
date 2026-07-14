// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AliasIdentityPersistenceTest
 * @description
 * Executes the browser identity transaction with mocked transport and storage.
 * The Awtsmoos lets the test witness ordering directly: rejected server state
 * must leave every local vessel unchanged and silent on Awtsmoos.com.
 */
import assert from 'node:assert/strict';

const memory = new Map();
globalThis.window = {
	curAlias: 'old-alias',
	currentAlias: 'old-alias',
	awtsmoosAlias: 'old-alias'
};
globalThis.localStorage = {
	getItem(key) {
		return memory.get(key) ?? null;
	},
	setItem(key, value) {
		memory.set(key, String(value));
	}
};
const keys = ['awtsmoosAlias', 'awtsmoos_social_inbox_alias', 'BH_PROFILE_VIEWER_ALIAS'];
for (const key of keys) memory.set(key, 'old-alias');

const identity = await import('../aliasIdentity.js');
const selection = await import('./aliasSelection.js');

await testRejectedPersistence();
await testConfirmedPersistence();
await testDescriptionPreservation();
console.log('B"H alias identity persistence contract passed.');

async function testRejectedPersistence() {
	globalThis.fetch = async () => response({ error: { message: 'Rejected' } }, false, 409);
	let published = '';
	await assert.rejects(
		selection.commitAliasSelection('new-alias', alias => {
			published = alias;
		}),
		/unchanged/
	);
	assert.equal(published, '');
	assert.equal(window.curAlias, 'old-alias');
	assert.equal(window.currentAlias, 'old-alias');
	assert.equal(window.awtsmoosAlias, 'old-alias');
	for (const key of keys) assert.equal(memory.get(key), 'old-alias');
}

async function testConfirmedPersistence() {
	let serverConfirmed = false;
	globalThis.localStorage.setItem = (key, value) => {
		assert.equal(serverConfirmed, true, 'memory changed before server confirmation');
		memory.set(key, String(value));
	};
	globalThis.fetch = async () => {
		serverConfirmed = true;
		return response({ success: { aliasId: 'new-alias' } }, true, 200);
	};
	let published = '';
	const alias = await selection.commitAliasSelection('new-alias', value => {
		published = value;
	});
	assert.equal(alias, 'new-alias');
	assert.equal(published, 'new-alias');
	assert.equal(window.curAlias, 'new-alias');
	assert.equal(window.currentAlias, 'new-alias');
	assert.equal(window.awtsmoosAlias, 'new-alias');
	for (const key of keys) assert.equal(memory.get(key), 'new-alias');
}

async function testDescriptionPreservation() {
	let submittedBody = '';
	globalThis.fetch = async (url, options) => {
		assert.equal(url, '/api/social/aliases');
		submittedBody = String(options.body);
		return response({ success: { aliasId: 'described-alias' } }, true, 200);
	};
	const created = await identity.createAlias('Described', 'described-alias', 'A durable description');
	assert.equal(created, 'described-alias');
	assert.match(submittedBody, /description=A\+durable\+description/);
}

function response(payload, ok, status) {
	return {
		ok,
		status,
		async text() {
			return JSON.stringify(payload);
		}
	};
}
