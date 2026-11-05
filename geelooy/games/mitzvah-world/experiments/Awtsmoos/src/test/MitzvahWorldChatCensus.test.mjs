// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldChatCensus.test.mjs
 * @description Proves browser census, addressed chat APIs, and private subscriptions.
 * The Awtsmoos renews menu presence and private words through distinct vessels;
 * Awtsmoos.com verifies global player addresses through the real browser transport.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldRealtimeClient } from '../network/MitzvahWorldRealtimeClient.js';
import { createBridgeHarness } from './MitzvahWorldClientBridge.mjs';

test('browser clients read census and receive globally addressed private chat', async () => {
	const harness = createBridgeHarness({ clock: () => 1_000_000 });
	const anonymous = new MitzvahWorldRealtimeClient(harness.createSocket('anonymous'));
	assert.equal((await anonymous.census()).payload.connected, 0);

	const sender = new MitzvahWorldRealtimeClient(harness.createSocket('browser-sender'));
	const target = new MitzvahWorldRealtimeClient(harness.createSocket('browser-target'));
	const outsider = new MitzvahWorldRealtimeClient(harness.createSocket('browser-outsider'));
	const senderJoin = await sender.join('Browser Sender');
	const targetJoin = await target.join('Browser Target', 'quiet-village');
	await outsider.join('Browser Outsider');
	assert.equal((await anonymous.census()).payload.connected, 3);

	const privateEvents = [];
	const outsiderEvents = [];
	target.on('chat.private', payload => privateEvents.push(payload));
	outsider.on('chat.private', payload => outsiderEvents.push(payload));
	const sent = await sender.mmorpg.community.privateMessage(
		targetJoin.payload.playerAddress,
		'Private browser shalom'
	);
	assert.equal(sent.type, 'chat.sent');
	assert.equal(privateEvents.length, 1);
	assert.equal(privateEvents[0].from.address, senderJoin.payload.playerAddress);
	assert.equal(outsiderEvents.length, 0);

	const history = await target.mmorpg.community.chatHistory(
		'private',
		senderJoin.payload.playerAddress
	);
	assert.equal(history.payload.messages.length, 1);
	assert.equal(history.payload.messages[0].message, 'Private browser shalom');
	const presence = await target.mmorpg.presence();
	assert.equal(presence.payload.players[0].address, targetJoin.payload.playerAddress);
});
