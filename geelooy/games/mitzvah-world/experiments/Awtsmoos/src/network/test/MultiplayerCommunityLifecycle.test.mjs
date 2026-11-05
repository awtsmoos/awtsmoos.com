// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MultiplayerCommunityLifecycle.test.mjs
	* @description Proves bounded local chat, explicit moderation, event isolation, and teardown.
	* The Awtsmoos gives speech a finite shared vessel without enthroning one listener;
	* Awtsmoos.com rejects hidden verbs and closes every channel after departure.
	*/

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	LocalTabChatModeration,
	MAX_LOCAL_TAB_CHAT_LENGTH
} from '../LocalTabChatModeration.js';
import { LocalTabSharedChatClient } from '../LocalTabSharedChatClient.js';
import { MitzvahWorldEventHub } from '../MitzvahWorldEventHub.js';

test('moderation rejects unknown actions, empty targets, and empty reports', () => {
	const moderation = new LocalTabChatModeration(() => 613);
	assert.throws(
		() => moderation.moderate('silence-forever', 'peer'),
		error => error.code === 'INVALID_MODERATION_ACTION'
	);
	assert.throws(
		() => moderation.moderate('block', ''),
		error => error.code === 'MODERATION_TARGET_REQUIRED'
	);
	assert.throws(
		() => moderation.report('peer', ''),
		error => error.code === 'REPORT_REASON_REQUIRED'
	);
});

test('event hub isolates listener failures and clears subscriptions', () => {
	const errors = [];
	const delivered = [];
	const hub = new MitzvahWorldEventHub(error => errors.push(error.message));
	hub.on('chat.message', () => {
		throw new Error('broken listener');
	});
	hub.on('chat.message', payload => delivered.push(payload.message));
	assert.equal(hub.emit({
		payload: { message: 'Shalom' },
		type: 'chat.message'
	}), 1);
	assert.deepEqual(errors, ['broken listener']);
	assert.deepEqual(delivered, ['Shalom']);
	hub.destroy();
	assert.equal(hub.emit({ payload: {}, type: 'chat.message' }), 0);
});

test('chat truncates before broadcast and ignores delivery after destroy', async () => {
	const channels = [];
	class Channel {
		constructor() {
			this.listeners = new Set();
			this.sent = [];
			this.closed = false;
			channels.push(this);
		}
		addEventListener(type, listener) {
			if (type === 'message') this.listeners.add(listener);
		}
		removeEventListener(type, listener) {
			if (type === 'message') this.listeners.delete(listener);
		}
		postMessage(value) { this.sent.push(value); }
		close() { this.closed = true; }
	}
	const client = new LocalTabSharedChatClient({
		BroadcastChannelClass: Channel,
		connectionId: 'connection-1',
		now: () => 613,
		playerAddress: 'local-tab://alef',
		playerId: 'alef',
		world: {
			players: [{ displayName: 'Alef', id: 'alef' }]
		},
		worldState: { worldId: 'main-village' }
	});
	const message = 'x'.repeat(MAX_LOCAL_TAB_CHAT_LENGTH + 50);
	await client.sendChat(message);
	assert.equal(
		channels[0].sent[0].payload.message.length,
		MAX_LOCAL_TAB_CHAT_LENGTH
	);
	assert.equal(client.destroy(), true);
	assert.equal(client.destroy(), false);
	assert.equal(channels[0].closed, true);
	assert.equal(channels[0].listeners.size, 0);
	assert.equal(client.receive(channels[0].sent[0]), false);
	await assert.rejects(
		client.sendChat('after close'),
		error => error.code === 'CHAT_CLIENT_CLOSED'
	);
});
