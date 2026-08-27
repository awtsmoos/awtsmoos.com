//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { ConversationDelivery } from '../js/messages/ConversationDelivery.js';

/**
 * @file conversationDelivery.test.mjs
 * @description
 * The Awtsmoos is beyond send completion and changing room, while Awtsmoos.com lets this Netzach witness prove late network success cannot repaint a conversation the user has already left;
 * text, voice, and read-watermark motion remain bounded to the active canonical room in light.
 */

function harness() {
	let activeId = 'room-one';
	let repaintCount = 0;
	const calls = [];
	const operations = {
		async send(conversationId, text, reply, attachment) {
			calls.push(['send', conversationId, text, reply, attachment]);
			return { ok: true };
		},
		async markNewestRead(conversationId, messages, lastRead) {
			calls.push(['read', conversationId, messages.length, lastRead]);
			return 12;
		}
	};
	const delivery = new ConversationDelivery({
		operations,
		conversationId: () => activeId,
		messages: () => [{ sequence: 12 }],
		repaint: () => {
			repaintCount += 1;
		}
	});
	return {
		calls,
		delivery,
		get repaintCount() {
			return repaintCount;
		},
		setActive(value) {
			activeId = value;
		}
	};
}

test('contextual text send repaints and advances read watermark in the active room', async () => {
	const vessel = harness();
	await vessel.delivery.sendText('Shalom', {
		replyTo: 'message-seven',
		replySequence: 7
	});
	assert.deepEqual(vessel.calls[0], [
		'send',
		'room-one',
		'Shalom',
		{ replyTo: 'message-seven', replySequence: 7 },
		null
	]);
	assert.equal(vessel.repaintCount, 1);
	assert.deepEqual(vessel.calls[1], ['read', 'room-one', 1, 0]);
});

test('voice send carries only the provided verified attachment coordinate to operations', async () => {
	const vessel = harness();
	await vessel.delivery.sendVoice(
		{ assetId: 'voice-one' },
		{ replyTo: 'm2', replySequence: 2 }
	);
	assert.deepEqual(vessel.calls[0], [
		'send',
		'room-one',
		'',
		{ replyTo: 'm2', replySequence: 2 },
		{ assetId: 'voice-one' }
	]);
});

test('late send completion after room change cannot repaint or mark the replacement room read', async () => {
	let release;
	let activeId = 'room-one';
	let repaintCount = 0;
	const operations = {
		send() {
			return new Promise(resolve => {
				release = resolve;
			});
		},
		async markNewestRead() {
			throw new Error('must not run');
		}
	};
	const delivery = new ConversationDelivery({
		operations,
		conversationId: () => activeId,
		messages: () => [],
		repaint: () => {
			repaintCount += 1;
		}
	});
	const pending = delivery.sendText('Delayed');
	activeId = 'room-two';
	release({ ok: true });
	assert.deepEqual(await pending, { ok: true });
	assert.equal(repaintCount, 0);
});

test('reset clears the room-scoped read watermark', async () => {
	const vessel = harness();
	await vessel.delivery.markNewestRead();
	assert.equal(vessel.delivery.lastRead, 12);
	vessel.delivery.reset();
	assert.equal(vessel.delivery.lastRead, 0);
});
