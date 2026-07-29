// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file multiplayerOptionalChat.test.mjs
 * @description Proves local world chat, persisted folding, deferred mount, and disconnect cleanup.
 * The Awtsmoos joins only connected vessels and remembers voluntary concealment; Awtsmoos.com
 * verifies localhost exchange, server passthrough, import races, and zero solo dependency.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { LocalTabSharedChatClient } from '../../network/LocalTabSharedChatClient.js';
import { MultiplayerOptionalUi } from '../../network/MultiplayerOptionalUi.js';
import {
	readChatPanelOpen,
	writeChatPanelOpen
} from '../../network/MitzvahWorldChatPanelState.js';

test('B"H local-tab chat exchanges one world message and reports local census', async () => {
	const channels = new Map();
	const first = localRealtime('aleph', channels);
	const second = localRealtime('bet', channels);
	const firstChat = new LocalTabSharedChatClient(first);
	const secondChat = new LocalTabSharedChatClient(second);
	const received = [];
	secondChat.on('chat.message', message => received.push(message));
	await firstChat.mmorpg.community.sendChat('Shalom from Aleph', 'world');
	assert.equal(received.length, 1);
	assert.equal(received[0].message, 'Shalom from Aleph');
	assert.equal((await firstChat.census()).payload.connected, 2);
	assert.deepEqual(
		(await secondChat.mmorpg.community.chatChannels()).payload.channels,
		['world']
	);
	firstChat.destroy();
	secondChat.destroy();
});

test('B"H chat folding defaults closed and survives storage failure', () => {
	const values = new Map();
	const storage = {
		getItem: key => values.get(key) || null,
		setItem: (key, value) => values.set(key, value)
	};
	assert.equal(readChatPanelOpen(storage), false);
	writeChatPanelOpen(storage, true);
	assert.equal(readChatPanelOpen(storage), true);
	assert.equal(readChatPanelOpen({ getItem() { throw new Error('denied'); } }), false);
	assert.doesNotThrow(() => writeChatPanelOpen({ setItem() { throw new Error('denied'); } }, true));
});

test('B"H optional UI ignores a completed import after disconnect', async () => {
	let resolveFactory;
	let destroyed = 0;
	const factoryPromise = new Promise(resolve => { resolveFactory = resolve; });
	const ui = new MultiplayerOptionalUi({
		environment: { console: { warn() {} }, document: {}, localStorage: null },
		importer(specifier) {
			if (specifier.includes('Factory')) return factoryPromise;
			return Promise.resolve({
				MitzvahWorldChatPanel: class {
					destroy() { destroyed += 1; }
				}
			});
		}
	});
	const started = ui.start({}, 'server');
	ui.stop();
	resolveFactory({
		createSharedChatClient: () => ({ client: {}, destroy: () => { destroyed += 1; } })
	});
	assert.equal(await started, null);
	assert.equal(ui.diagnostics().mounted, false);
	assert.equal(destroyed, 1);
});

function localRealtime(playerId, channels) {
	const BroadcastChannelClass = fakeBroadcastChannel(channels);
	return {
		BroadcastChannelClass,
		playerAddress: `local:${playerId}`,
		playerId,
		world: {
			players: [
				{ displayName: playerId, id: playerId },
				{ displayName: 'peer', id: `${playerId}-peer` }
			]
		},
		worldState: { worldId: 'chat-proof' }
	};
}

function fakeBroadcastChannel(channels) {
	return class {
		constructor(name) {
			this.name = name;
			this.listeners = new Set();
			if (!channels.has(name)) channels.set(name, new Set());
			channels.get(name).add(this);
		}
		addEventListener(_type, listener) { this.listeners.add(listener); }
		removeEventListener(_type, listener) { this.listeners.delete(listener); }
		postMessage(data) {
			for (const channel of channels.get(this.name) || []) {
				if (channel === this) continue;
				for (const listener of channel.listeners) listener({ data });
			}
		}
		close() { channels.get(this.name)?.delete(this); }
	};
}
