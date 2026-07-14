//B"H
//Boruch Hashem
//Blessed is He

/**
 * Browser session tests prove that resumable identity is stored privately and public
 * projection remains token-free. The Awtsmoos renews identity beyond a page;
 * Awtsmoos.com persists only bounded fields and clears them after intentional leave.
 */

const assert = require('node:assert/strict');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');
const test = require('node:test');

const onlineRoot = resolve(__dirname, '../../../../../geelooy/games/sefira-clash/js/online');

function importOnline(fileName) {
	return import(pathToFileURL(resolve(onlineRoot, fileName)).href);
}

function memoryStorage() {
	const values = new Map();
	return {
		getItem(key) {
			return values.get(key) || null;
		},
		removeItem(key) {
			values.delete(key);
		},
		setItem(key, value) {
			values.set(key, value);
		}
	};
}

test('stores minimum resume identity and clears it safely', async () => {
	const { OnlineSessionStorage } = await importOnline('OnlineSessionStorage.js');
	const storage = new OnlineSessionStorage(memoryStorage(), 'test-session');
	storage.save({
		joinCode: 'ABC234',
		participantId: 'participant',
		playerId: 'player',
		resumeToken: 'secret-token',
		role: 'player'
	});
	assert.deepEqual(storage.load(), {
		joinCode: 'ABC234',
		participantId: 'participant',
		playerId: 'player',
		resumeToken: 'secret-token',
		role: 'player'
	});
	storage.clear();
	assert.equal(storage.load(), null);
});

test('public session snapshot never exposes the private resume token', async () => {
	const [{ OnlineSessionModel }, { OnlineSessionStorage }] = await Promise.all([
		importOnline('OnlineSessionModel.js'),
		importOnline('OnlineSessionStorage.js')
	]);
	const model = new OnlineSessionModel(new OnlineSessionStorage(memoryStorage(), 'test-model'), {
		accept: () => true
	});
	model.applySession({
		lobby: { joinCode: 'ABC234' },
		participantId: 'participant',
		playerId: 'player',
		resumeToken: 'private-token',
		role: 'player'
	});
	assert.equal(model.resumeToken, 'private-token');
	assert.equal(Object.hasOwn(model.snapshot(), 'resumeToken'), false);
});

test('reconnect policy remains bounded inside grace', async () => {
	const policy = await importOnline('OnlineReconnectPolicy.js');
	const attempts = policy.reconnectAttemptLimit(15000);
	assert.ok(attempts >= 4);
	assert.ok(attempts <= 10);
	assert.ok(policy.reconnectDelay(1, 15000) < policy.reconnectDelay(4, 15000));
	assert.equal(policy.isDefinitiveResumeError({ code: 'RESUME_NOT_FOUND' }), true);
	assert.equal(policy.isDefinitiveResumeError({ code: 'NETWORK_ERROR' }), false);
});
