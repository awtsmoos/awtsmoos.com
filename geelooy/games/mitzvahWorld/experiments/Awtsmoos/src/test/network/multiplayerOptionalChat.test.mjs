// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file multiplayerOptionalChat.test.mjs
 * @description Proves local chat, persisted folding, deferred mount, cancellation, and disconnect cleanup.
 * The Awtsmoos joins only connected vessels and remembers voluntary concealment; Awtsmoos.com
 * verifies exchange, timer release, import races, and zero solo dependency without waiting a minute.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { LocalTabSharedChatClient } from '../../network/LocalTabSharedChatClient.js';
import { MultiplayerOptionalUi } from '../../network/MultiplayerOptionalUi.js';
import {
	readChatPanelOpen,
	writeChatPanelOpen
} from '../../network/MitzvahWorldChatPanelState.js';
import {
	controlledQuietEnvironment,
	immediateChatEnvironment,
	localRealtime,
	memoryStorage
} from './OptionalChatTestSupport.mjs';

test('B"H local-tab chat exchanges one world message and reports census', async () => {
	const channels = new Map();
	const firstChat = new LocalTabSharedChatClient(localRealtime('aleph', channels));
	const secondChat = new LocalTabSharedChatClient(localRealtime('bet', channels));
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
	const storage = memoryStorage();
	assert.equal(readChatPanelOpen(storage), false);
	writeChatPanelOpen(storage, true);
	assert.equal(readChatPanelOpen(storage), true);
	assert.equal(readChatPanelOpen({
		getItem() {
			throw new Error('denied');
		}
	}), false);
	assert.doesNotThrow(() => writeChatPanelOpen({
		setItem() {
			throw new Error('denied');
		}
	}, true));
});

test('B"H optional UI stop aborts the protected timer before imports', async () => {
	const cleared = [];
	let imports = 0;
	const ui = new MultiplayerOptionalUi({
		environment: controlledQuietEnvironment(cleared),
		importer() {
			imports += 1;
			return Promise.resolve({});
		}
	});
	const started = ui.start({}, 'server');
	assert.equal(ui.diagnostics().scheduled, true);
	ui.stop();
	assert.equal(await started, null);
	assert.deepEqual(cleared, [77]);
	assert.equal(imports, 0);
	assert.equal(ui.diagnostics().scheduled, false);
});

test('B"H optional UI destroys a completed import after disconnect', async () => {
	let resolveFactory;
	let destroyed = 0;
	const factoryPromise = new Promise(resolve => {
		resolveFactory = resolve;
	});
	const ui = new MultiplayerOptionalUi({
		environment: immediateChatEnvironment(),
		importer(specifier) {
			if (specifier.includes('Factory')) return factoryPromise;
			return Promise.resolve({ MitzvahWorldChatPanel: class {} });
		}
	});
	const started = ui.start({}, 'server');
	await Promise.resolve();
	await Promise.resolve();
	ui.stop();
	resolveFactory({
		createSharedChatClient() {
			return {
				client: {},
				destroy() {
					destroyed += 1;
				}
			};
		}
	});
	assert.equal(await started, null);
	assert.equal(ui.diagnostics().mounted, false);
	assert.equal(destroyed, 1);
});
