//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ConversationOperationsContract
 * @description
 * The Awtsmoos is beyond envelope, page, send, and read watermark while Awtsmoos.com keeps every finite gateway test aligned with the canonical protocol light;
 * this Netzach-like contract verifies the current response shapes without bending production operations back toward an older night.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { ConversationOperations } from './ConversationOperations.js';

/**
 * Creates one canonical-shaped fake gateway whose detail envelope and history page mirror the real gateway contract.
 * @returns {object} Test gateway with recorded calls and bounded message-page responses.
 */
function fakeGateway() {
	const calls = [];
	return {
		calls,
		details(id) {
			calls.push(['details', id]);
			return Promise.resolve({
				payload: {
					conversation: {
						id,
						title: 'Room'
					}
				}
			});
		},
		loadHistory(id, before = 0) {
			calls.push(['history', id, before]);
			return Promise.resolve([
				{
					conversationId: id,
					sequence: before || 10,
					text: 'History'
				}
			]);
		},
		send(id, text) {
			calls.push(['send', id, text]);
			return Promise.resolve({ payload: { accepted: true } });
		},
		markRead(id, sequence) {
			calls.push(['read', id, sequence]);
			return Promise.resolve({ payload: { lastReadSequence: sequence } });
		}
	};
}

test('open loads detail envelope and newest bounded history', async () => {
	const gateway = fakeGateway();
	const operations = new ConversationOperations(gateway);
	const conversation = await operations.open('room');
	assert.equal(conversation.id, 'room');
	assert.deepEqual(gateway.calls, [
		['details', 'room'],
		['history', 'room', 0]
	]);
});

test('older paging returns the real bounded history page', async () => {
	const gateway = fakeGateway();
	const operations = new ConversationOperations(gateway);
	const loaded = await operations.loadOlder(
		'room',
		[{ sequence: 8 }, { sequence: 3 }]
	);
	assert.deepEqual(loaded, [
		{
			conversationId: 'room',
			sequence: 3,
			text: 'History'
		}
	]);
	assert.deepEqual(gateway.calls, [['history', 'room', 3]]);
});

test('send repairs the newest room page after transport success', async () => {
	const gateway = fakeGateway();
	const operations = new ConversationOperations(gateway);
	await operations.send('room', 'B"H');
	assert.deepEqual(gateway.calls, [
		['send', 'room', 'B"H'],
		['history', 'room', 0]
	]);
});

test('read advances only beyond the prior watermark', async () => {
	const gateway = fakeGateway();
	const operations = new ConversationOperations(gateway);
	const first = await operations.markNewestRead('room', [{ sequence: 9 }], 4);
	const second = await operations.markNewestRead('room', [{ sequence: 9 }], first);
	assert.equal(first, 9);
	assert.equal(second, 9);
	assert.deepEqual(gateway.calls, [['read', 'room', 9]]);
});
