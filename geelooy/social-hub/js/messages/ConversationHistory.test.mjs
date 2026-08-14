//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos keeps bounded private history measurable without inventing message identity beyond canonical ids and sequences;
 * Awtsmoos.com tests paging and read-watermark helpers so the inline room can remain small while the real PrivateMessagingStore owns history.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	canLoadOlder,
	conversationMessages,
	messageKey,
	newestSequence,
	oldestSequence
} from './ConversationHistory.js';

test('reads one canonical conversation page from the private store map', () => {
	const store = {
		messages: new Map([
			['room', [{ id: 'm1', sequence: 2, text: 'B\"H' }]]
		])
	};
	assert.equal(conversationMessages(store, 'room').length, 1);
	assert.deepEqual(conversationMessages(store, 'missing'), []);
});

test('sequence helpers derive oldest and newest positive watermarks', () => {
	const messages = [
		{ sequence: 8 },
		{ sequence: 3 },
		{ sequence: 11 },
		{ sequence: 0 }
	];
	assert.equal(oldestSequence(messages), 3);
	assert.equal(newestSequence(messages), 11);
});

test('older-history affordance appears only after sequence one', () => {
	assert.equal(canLoadOlder([{ sequence: 1 }, { sequence: 3 }]), false);
	assert.equal(canLoadOlder([{ sequence: 2 }, { sequence: 3 }]), true);
});

test('message key prefers canonical id then sequence then local fallback', () => {
	assert.equal(messageKey({ id: 'message-a', sequence: 9 }, 0), 'message-a');
	assert.equal(messageKey({ sequence: 9 }, 0), '9');
	assert.equal(messageKey({}, 4), 'message-4');
});
