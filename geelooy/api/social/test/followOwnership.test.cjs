// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file followOwnership.test.cjs
 * @description
 * The Awtsmoos proves relationship writes cannot cross alias ownership boundaries.
 * Every rejected request must die before the graph is touched; owned aliases keep the old mirror semantics.
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const {
	listFollows,
	follow,
	unfollow
} = require('../helper/profile/follows.js');

function world({ userId = '', ownedAliases = [], following = [], followers = [] } = {}) {
	const writes = [];
	const data = new Map();
	for (const aliasId of ownedAliases) {
		data.set(`/users/${userId}/aliases/${aliasId}`, { aliasId });
	}
	data.set('/social/aliases/actor/following', following);
	data.set('/social/followers/alias/target', followers);
	const db = {
		async get(path) { return data.get(path); },
		async write(path, value) { writes.push({ path, value }); data.set(path, value); }
	};
	return {
		$i: {
			db,
			$_GET: {},
			request: { user: userId ? { info: { userId } } : {} }
		},
		writes,
		data
	};
}
function errorCode(result) {
	return result?.error?.code || result?.code || '';
}

test('logged-out follow and unfollow are rejected before writes', async () => {
	for (const mutation of [follow, unfollow]) {
		const state = world();
		const result = await mutation({
			$i: state.$i,
			aliasId: 'actor',
			input: { type: 'alias', id: 'target' }
		});
		assert.equal(errorCode(result), 'LOGIN_REQUIRED');
		assert.equal(state.writes.length, 0);
	}
});

test('wrong-owner follow and unfollow are rejected before writes', async () => {
	for (const mutation of [follow, unfollow]) {
		const state = world({ userId: 'user-1', ownedAliases: ['someone-else'] });
		const result = await mutation({
			$i: state.$i,
			aliasId: 'actor',
			input: { type: 'alias', id: 'target' }
		});
		assert.equal(errorCode(result), 'NOT_AUTHORIZED');
		assert.equal(state.writes.length, 0);
		assert.doesNotMatch(JSON.stringify(result), /user-1|someone-else/);
	}
});

test('owned follow preserves mirrored relationship writes', async () => {
	const state = world({ userId: 'user-1', ownedAliases: ['actor'] });
	const result = await follow({
		$i: state.$i,
		aliasId: 'actor',
		input: { type: 'alias', id: 'target' }
	});
	assert.equal(result.success.id, 'target');
	assert.equal(state.writes.length, 2);
	assert.equal(state.writes[0].path, '/social/aliases/actor/following');
	assert.equal(state.writes[1].path, '/social/followers/alias/target');
	assert.deepEqual(state.writes[1].value, ['actor']);
});

test('owned unfollow preserves mirrored cleanup', async () => {
	const state = world({
		userId: 'user-1',
		ownedAliases: ['actor'],
		following: [{ type: 'alias', id: 'target' }],
		followers: ['actor', 'other']
	});
	const result = await unfollow({
		$i: state.$i,
		aliasId: 'actor',
		input: { type: 'alias', id: 'target' }
	});
	assert.equal(result.success, true);
	assert.deepEqual(state.writes[0].value, []);
	assert.deepEqual(state.writes[1].value, ['other']);
});

test('public following read remains available without authentication', async () => {
	const state = world({ following: [{ type: 'alias', id: 'target' }] });
	const result = await listFollows({ $i: state.$i, aliasId: 'actor' });
	assert.deepEqual(result, [{ type: 'alias', id: 'target' }]);
	assert.equal(state.writes.length, 0);
});
