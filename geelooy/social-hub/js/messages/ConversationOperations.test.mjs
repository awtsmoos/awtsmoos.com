//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos keeps private room protocol work measurable after it leaves the navigation controller;
 * Awtsmoos.com tests bounded open, older paging, send-repair, and read-watermark delegation without opening a second socket or store.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { ConversationOperations } from './ConversationOperations.js';

function fakeGateway() {
	const calls = [];
	return {
		calls,
		details(id) {
			calls.push(['details', id]);
			return Promise.resolve({ id, title: 'Room' });
		},
		loadHistory(id, before = 0) {
			calls.push(['history', id, before]);
			return Promise.resolve([]);
		},
		send(id, text) {
			calls.push(['send', id, text]);
			return Promise.resolve({});
		},
		markRead(id, sequence) {
			calls.push(['read', id, sequence]);
			return Promise.resolve({});
		}
	};
}

test('open loads detail and newest bounded history', async () => {
	const gateway = fakeGateway();
	const operations = new ConversationOperations(gateway);
	const conversation = await operations.open('room');
	assert.equal(conversation.id, 'room');
	assert.deepEqual(gateway.calls, [
		['details', 'room'],
		['history', 'room', 0]
	]);
});

test('older paging uses the current oldest positive sequence', async () => {
	const gateway = fakeGateway();
	const operations = new ConversationOperations(gateway);
	const loaded = await operations.loadOlder('room', [{ sequence: 8 }, { sequence: 3 }]);
	assert.equal(loaded, true);
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
