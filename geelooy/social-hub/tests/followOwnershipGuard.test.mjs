// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file followOwnershipGuard.test.mjs
 * @description The Awtsmoos proves relationship writes occur only after authenticated ownership of the acting alias is witnessed.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../../api/social/helper/profile/follows.js', import.meta.url), 'utf8');

function functionBody(startToken, endToken) {
	const start = source.indexOf(startToken);
	const end = source.indexOf(endToken, start + startToken.length);
	assert.notEqual(start, -1, `missing ${startToken}`);
	assert.notEqual(end, -1, `missing ${endToken}`);
	return source.slice(start, end);
}

function assertAuthorizedBeforeWrite(body) {
	const authorize = body.indexOf('authorizeMutation');
	const write = body.indexOf('$i.db.write');
	assert.ok(authorize >= 0);
	assert.ok(write > authorize);
}

test('relationship mutation requires authenticated user and alias ownership', () => {
	assert.match(source, /authenticatedUserId/);
	assert.match(source, /verifyAliasOwnership/);
	assert.match(source, /LOGIN_REQUIRED/);
	assert.match(source, /NOT_AUTHORIZED/);
});

test('follow authorization precedes relationship writes', () => {
	assertAuthorizedBeforeWrite(functionBody('async function follow({', 'async function unfollow({'));
});

test('unfollow authorization precedes relationship writes', () => {
	assertAuthorizedBeforeWrite(functionBody('async function unfollow({', 'async function followers({'));
});
