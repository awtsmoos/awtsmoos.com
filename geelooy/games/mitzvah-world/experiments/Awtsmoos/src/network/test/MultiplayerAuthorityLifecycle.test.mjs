// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MultiplayerAuthorityLifecycle.test.mjs
	* @description Proves repeated starts stay singular and stopped generations stay silent.
	* The Awtsmoos permits one active authority doorway at a time;
	* Awtsmoos.com rejects every receipt that returns after its generation has departed.
	*/

import assert from 'node:assert/strict';
import test from 'node:test';
import { MultiplayerDefenseAuthority } from '../MultiplayerDefenseAuthority.js';
import { MultiplayerKavanahAuthority } from '../MultiplayerKavanahAuthority.js';
import { MultiplayerSupportAuthority } from '../MultiplayerSupportAuthority.js';

test('defense start is idempotent and late receipt is silent', async () => {
	const bus = createBus();
	const request = deferred();
	const authority = new MultiplayerDefenseAuthority({
		mmorpg: { rpg: { defend: () => request.promise } }
	}, { bus });
	authority.start();
	authority.start();
	assert.equal(bus.subscriptionCount('combat:defense-intent'), 1);
	bus.emit('combat:defense-intent', { actionId: 'guard' });
	authority.stop();
	request.resolve({ payload: { guarded: true } });
	await request.promise;
	await Promise.resolve();
	assert.equal(bus.events.some(event => event.type === 'combat:defense-authority'), false);
});

test('support stop suppresses an in-flight cast result', async () => {
	const bus = createBus();
	const request = deferred();
	const authority = new MultiplayerSupportAuthority({
		playerId: 'alef',
		mmorpg: { rpg: { supportCast: () => request.promise } }
	}, { bus }, {
		waitForAction: () => Promise.resolve({
			kavanah: { elapsedMilliseconds: 613 }
		})
	});
	authority.start();
	authority.start();
	assert.equal(bus.subscriptionCount('combat:cast-complete'), 1);
	bus.emit('combat:cast-complete', {
		actionId: 'waters-of-purification',
		supportKind: 'cleanse'
	});
	await Promise.resolve();
	authority.stop();
	request.resolve({ payload: { cleansed: true } });
	await request.promise;
	await Promise.resolve();
	assert.equal(bus.events.some(event => event.type === 'combat:support-authority'), false);
});

test('Kavanah stop suppresses an old start receipt', async () => {
	const bus = createBus();
	const request = deferred();
	const authority = new MultiplayerKavanahAuthority({
		mmorpg: {
			rpg: {
				startKavanah: () => request.promise
			}
		}
	}, {
		bus,
		input: { axes: () => ({ forward: 0, strafe: 0 }) }
	});
	authority.start();
	authority.start();
	assert.equal(bus.subscriptionCount('combat:kavanah-start'), 1);
	bus.emit('combat:kavanah-start', { actionId: 'letter-light' });
	authority.stop();
	request.resolve({ payload: { kavanah: { active: true, castId: 'old' } } });
	await request.promise;
	await Promise.resolve();
	assert.equal(authority.serverState, null);
	assert.equal(bus.events.some(event => event.type === 'combat:kavanah-authority-start'), false);
});

function createBus() {
	const handlers = new Map();
	return {
		events: [],
		emit(type, payload) {
			this.events.push({ payload, type });
			for (const handler of [...(handlers.get(type) || [])]) handler(payload);
		},
		on(type, handler) {
			if (!handlers.has(type)) handlers.set(type, new Set());
			handlers.get(type).add(handler);
			return () => handlers.get(type)?.delete(handler);
		},
		subscriptionCount(type) {
			return handlers.get(type)?.size || 0;
		}
	};
}

function deferred() {
	let resolve;
	const promise = new Promise(value => { resolve = value; });
	return { promise, resolve };
}
