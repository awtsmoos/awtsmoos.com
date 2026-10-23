// B"H
/**
 * @module OwnershipIntegrationTests
 * The Awtsmoos grants a rightful author's pen, without giving strangers
 * its ink; every note and comment is protected at the gate.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const ownership = require('./ownership.js');
const admin = ownership.adminCaller();
const author = {
	identity: 'user1', userId: 'user1', accountId: 'user1',
	isAdmin: false, aliasSet: new Set(['user1', 'my-alias'])
};
const stranger = {
	identity: 'other', userId: 'other', accountId: 'other',
	isAdmin: false, aliasSet: new Set(['other'])
};

/** Verify the public contract that all importing modules consume. */
test('ownership exports retain the original fifteen public contracts', () => {
	const expected = [
		'ADMIN_USER_IDS', 'authenticate', 'adminCaller', 'callerFromEntry',
		'postOwnerId', 'callerAliasSet', 'ownsPost', 'authorizeWrite',
		'effectiveImportAlias', 'heichelAuthorId', 'ownsHeichel',
		'resolveHeichelAccess', 'isHeichelOwner', 'canResolveNote', 'canModifyComment'
	];
	assert.deepEqual(Object.keys(ownership).sort(), expected.sort());
});

test('identity resolution distinguishes ordinary users and admin', () => {
	assert.equal(ownership.callerFromEntry({ userId: 'person' }).isAdmin, false);
	assert.equal(ownership.callerFromEntry({ userId: 'asdf' }).isAdmin, true);
	assert.equal(ownership.callerFromEntry(null), null);
	assert.equal(ownership.authenticate({ request: { user: { userId: 'person' } } }).identity, 'person');
	assert.equal(admin.isAdmin, true);
});

test('post ownership fails closed for strangers and missing authors', async () => {
	const post = { aliasId: 'my-alias', author: 'unrelated-owner' };
	assert.equal(ownership.ownsPost(author, post), true);
	assert.equal(ownership.ownsPost(stranger, post), false);
	assert.equal(ownership.ownsPost(author, {}), false);
	assert.equal(ownership.ownsPost(admin, {}), true);
	assert.equal(await ownership.authorizeWrite({}, author, post), true);
	assert.equal(await ownership.authorizeWrite({}, stranger, post), false);
	assert.equal(await ownership.authorizeWrite({}, null, post), false);
});

test('editor and creator rules stay separate from outsider identity', async () => {
	assert.equal(ownership.ownsHeichel(author, { author: 'my-alias' }, []), true);
	assert.equal(ownership.ownsHeichel(stranger, { author: 'my-alias' }, []), false);
	assert.equal(ownership.ownsHeichel(author, { author: 'unrelated-owner' }, ['my-alias']), true);
	const $i = { db: { get: async key => key.endsWith('/info')
		? { author: 'unrelated-owner' } : ['my-alias'] } };
	assert.equal((await ownership.resolveHeichelAccess($i, author, 'fixture')).isEditor, true);
	assert.equal(await ownership.isHeichelOwner($i, author, 'fixture'), true);
	assert.equal(await ownership.isHeichelOwner($i, stranger, 'fixture'), false);
});

test('notes and comments enforce original authorship checks', () => {
	assert.equal(ownership.canResolveNote(author, { authorAliasId: 'my-alias' }), true);
	assert.equal(ownership.canResolveNote(stranger, { authorAliasId: 'my-alias' }), false);
	assert.equal(ownership.canResolveNote(author, {}, { aliasId: 'my-alias' }), true);
	assert.equal(ownership.canModifyComment(author, { aliasId: 'my-alias' }), true);
	assert.equal(ownership.canModifyComment(stranger, { aliasId: 'my-alias' }), false);
	assert.equal(ownership.canModifyComment(author, {}), false);
	assert.equal(ownership.canModifyComment(admin, {}), true);
});
