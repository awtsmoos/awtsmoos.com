// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file localTabChatModeration.test.mjs
 * @description Proves local-tab mute, unmute, block, filtered history, and bounded reports.
 * The Awtsmoos joins nearby windows while each listener guards one finite vessel; Awtsmoos.com
 * verifies canonical local addresses, hidden delivery, restored delivery, snapshots, and evidence.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { LocalTabSharedChatClient } from '../../network/LocalTabSharedChatClient.js';

test('B"H local-tab personal moderation filters live and historical world chat', async () => {
	const channels = new Map();
	const Channel = channelClass(channels);
	const first = new LocalTabSharedChatClient(realtime('aleph', Channel));
	const second = new LocalTabSharedChatClient(realtime('bet', Channel));
	const received = [];
	second.on('chat.message', message => received.push(message.message));
	await second.mmorpg.community.moderateChat('mute', 'aleph');
	await first.mmorpg.community.sendChat('hidden', 'world');
	assert.deepEqual(received, []);
	assert.deepEqual((await second.mmorpg.community.chatHistory()).payload.messages, []);
	await second.mmorpg.community.moderateChat('unmute', 'local:aleph');
	await first.mmorpg.community.sendChat('visible', 'world');
	assert.deepEqual(received, ['visible']);
	await second.mmorpg.community.moderateChat('block', 'aleph');
	const snapshot = await second.mmorpg.community.chatModerationSnapshot();
	assert.deepEqual(snapshot.payload.blockedPlayerAddresses, ['local:aleph']);
	const report = await second.mmorpg.community.reportChat(
		'aleph',
		'Repeated disruption',
		'message-1'
	);
	assert.equal(report.payload.targetAddress, 'local:aleph');
	assert.equal(report.payload.messageId, 'message-1');
	first.destroy();
	second.destroy();
});

function realtime(playerId, BroadcastChannelClass) {
	return {
		BroadcastChannelClass,
		playerAddress: `local:${playerId}`,
		playerId,
		world: { players: [{ displayName: playerId, id: playerId }] },
		worldState: { worldId: 'moderation-world' }
	};
}

function channelClass(channels) {
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
